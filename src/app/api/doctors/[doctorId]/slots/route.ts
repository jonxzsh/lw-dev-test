import { createId } from "@paralleldrive/cuid2";
import { and, eq, gt, lt } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "~/env";
import { difMins, minsToMs } from "~/lib/utils";
import { CreateSlotsBodySchema } from "~/lib/zod-schema/slots";
import { db } from "~/server/db";
import { doctors, repeatingSlotRules, slots } from "~/server/db/schema";

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ doctorId: string }> },
) => {
  const { doctorId } = await params;

  const doctorExists = await db.query.doctors.findFirst({
    where: eq(doctors.id, doctorId),
  });
  if (!doctorExists)
    return NextResponse.json(
      {
        success: false,
        message: "No doctor exists with this ID",
      },
      { status: 404 },
    );

  let body;
  try {
    const bodyJson: unknown = await req.json();
    body = CreateSlotsBodySchema.parse(bodyJson);
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        message: "Bad Request",
        error: env.NODE_ENV === "development" ? e : null,
      },
      { status: 500 },
    );
  }

  const durationMins = body.duration === "15m" ? 15 : 30;
  const startTime = new Date(body.start_time);
  const endTime = new Date(body.end_time);

  const minsBetween = difMins(endTime, startTime);

  if (minsBetween < durationMins)
    return NextResponse.json(
      {
        success: false,
        message:
          "Time between start and end times doesn't leave enough time for atleast one slot",
      },
      { status: 400 },
    );

  if (body.repeating) {
    const insertedRepeatingSlotRules = await db
      .insert(repeatingSlotRules)
      .values({
        startTime,
        endTime,
        repeatingDuration: body.duration,
        repeatingType: body.repeating.repeating_type,
        repeatingWeekdays: body.repeating.repeating_weekdays,
        doctorId,
      })
      .returning();
    const insertedRepeatingSlotRule = insertedRepeatingSlotRules.at(0);
    if (!insertedRepeatingSlotRule)
      return NextResponse.json(
        {
          success: false,
          message: "Internal Database Error",
        },
        { status: 500 },
      );

    return NextResponse.json({
      success: true,
      insertedRepeatingSlotRule,
    });
  } else {
    const totalSlots = Math.round(minsBetween / durationMins);

    const slotsToInsert: (typeof slots.$inferSelect)[] = Array.from({
      length: totalSlots,
    }).map((_, index) => {
      const startsAt = new Date(
        startTime.getTime() + minsToMs(index * durationMins),
      );
      const endsAt = new Date(startsAt.getTime() + minsToMs(durationMins));

      return {
        id: createId(),
        startsAt,
        endsAt,
        duration: body.duration,
        status: "available",
        doctorId,
        repeatingSlotRuleId: null,
      };
    });

    for (const slot of slotsToInsert) {
      const slotConflict = await db.query.slots.findFirst({
        where: and(
          eq(slots.doctorId, doctorId),
          lt(slots.startsAt, slot.endsAt), //existing ends before new slots time
          gt(slots.endsAt, slot.startsAt), //existing starts after new slots end
        ),
      });
      if (slotConflict)
        return NextResponse.json(
          {
            success: false,
            message: `Slot Conflict: Slot ${slotConflict.id}'s timing conflicts with the slot you tried to create starting ${slot.startsAt.toLocaleTimeString()} and ending at ${slot.endsAt.toLocaleTimeString()}`,
          },
          { status: 400 },
        );
    }

    const insertedSlots = await db
      .insert(slots)
      .values(slotsToInsert)
      .returning();

    return NextResponse.json({ success: true, insertedSlots });
  }
};
