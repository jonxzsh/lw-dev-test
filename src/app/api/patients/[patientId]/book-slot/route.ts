import { and, eq, gt, lt } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "~/env";
import { difMins, minsToMs } from "~/lib/b-utils";
import { BookSlotBodySchema } from "~/lib/zod-schema/slots";
import { db } from "~/server/db";
import {
  bookings,
  patients,
  repeatingSlotRules,
  slots,
} from "~/server/db/schema";

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> },
) => {
  const { patientId } = await params;

  const patientExists = await db.query.patients.findFirst({
    where: eq(patients.id, patientId),
  });
  if (!patientExists)
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
    body = BookSlotBodySchema.parse(bodyJson);
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

  if (body.slot_type === "present_in_database") {
    const slot = await db.query.slots.findFirst({
      where: and(eq(slots.id, body.slot_id!), eq(slots.status, "available")),
    });
    if (!slot)
      return NextResponse.json(
        {
          success: false,
          message: "No slot exists with this ID or it has already been booked",
        },
        { status: 404 },
      );

    await db
      .update(slots)
      .set({
        status: "booked",
      })
      .where(eq(slots.id, slot.id));

    const insertedBookings = await db
      .insert(bookings)
      .values({
        reason: body.booking_reason ?? null,
        slotId: slot.id,
        patientId: patientExists.id,
        doctorId: slot.doctorId,
      })
      .returning();
    const insertedBooking = insertedBookings.at(0);
    if (!insertedBooking)
      return NextResponse.json(
        {
          success: false,
          message: "Internal Database Error",
        },
        { status: 500 },
      );

    return NextResponse.json({ success: true, insertedBooking });
  } else {
    const bodyRuleSlot = body.rule_slot!; //<< zod handles ensuring this exists already
    const requestedStartAt = new Date(bodyRuleSlot.starts_at);
    const requestedEndsAt = new Date(bodyRuleSlot.ends_at);
    const requestedDuration = difMins(requestedEndsAt, requestedStartAt);

    const repeatingRule = await db.query.repeatingSlotRules.findFirst({
      where: eq(repeatingSlotRules.id, bodyRuleSlot.rule_id),
    });
    if (!repeatingRule)
      return NextResponse.json(
        {
          success: false,
          message: "No repeating rule exists with this ID",
        },
        { status: 404 },
      );

    const repeatingRuleDuration =
      repeatingRule.repeatingDuration === "15m" ? 15 : 30;

    console.log(requestedDuration, repeatingRuleDuration);
    const invalidConditions = [
      requestedDuration !== repeatingRuleDuration, //ensure the duration isn't longer than the rule's duration
      requestedStartAt.getTime() > repeatingRule.endTime.getTime(), //ensure it doesn't start after the rule time ends
      new Date(
        requestedStartAt.getTime() + minsToMs(repeatingRuleDuration),
      ).getTime() > repeatingRule.endTime.getTime(), //ensure it+booking duration doesn't go over the rule time ends
      requestedStartAt.getTime() < repeatingRule.startTime.getTime(), //ensure it doesn't start before the rule time starts
    ];
    const invalidConditionIndex = invalidConditions.findIndex(
      (c) => c === true,
    );
    const isRequestInvalid = invalidConditionIndex !== -1;

    if (isRequestInvalid)
      return NextResponse.json(
        {
          success: false,
          message: `Invalid request (${invalidConditionIndex})`,
        },
        { status: 400 },
      );

    const slotHasConflict = await db.query.slots.findFirst({
      where: and(
        eq(slots.doctorId, repeatingRule.doctorId),
        eq(slots.status, "booked"),
        lt(slots.startsAt, requestedEndsAt), //existing ends before new slots time
        gt(slots.endsAt, requestedStartAt), //existing starts after new slots end
      ),
    });
    if (slotHasConflict)
      return NextResponse.json(
        {
          success: false,
          message: "A booked slot conflicts with this one",
        },
        { status: 400 },
      );

    const insertedSlots = await db
      .insert(slots)
      .values({
        doctorId: repeatingRule.doctorId,
        duration: repeatingRule.repeatingDuration,
        startsAt: requestedStartAt,
        endsAt: requestedEndsAt,
        status: "booked",
        repeatingSlotRuleId: repeatingRule.id,
      })
      .returning();
    const insertedSlot = insertedSlots.at(0);
    if (!insertedSlot)
      return NextResponse.json(
        { success: false, message: "Internal Database Error" },
        { status: 500 },
      );

    const insertedBookings = await db
      .insert(bookings)
      .values({
        slotId: insertedSlot.id,
        patientId: patientExists.id,
        doctorId: repeatingRule.doctorId,
        reason: body.booking_reason,
      })
      .returning();
    const insertedBooking = insertedBookings.at(0);
    if (!insertedBooking)
      return NextResponse.json(
        { success: false, message: "Internal Database Error" },
        { status: 500 },
      );

    return NextResponse.json({ success: true, insertedBooking });
  }
};
