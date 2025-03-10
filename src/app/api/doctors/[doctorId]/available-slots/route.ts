import { and, arrayContains, eq, gt, lt, or } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { generateSlotsFromRepeatingRule } from "~/lib/b-utils";
import { type GetAvailableSlotsSuccessResponse } from "~/lib/types";
import { db } from "~/server/db";
import { doctors, repeatingSlotRules, slots } from "~/server/db/schema";

type ApiSlot = {
  slotId: string | null;
  startsAt: Date;
  endsAt: Date;
  duration: string;
  repeatingRuleId: string | null;
};

export const GET = async (
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

  const searchParams = req.nextUrl.searchParams;
  const date = searchParams.get("date");

  if (!date || typeof date !== "string")
    return NextResponse.json(
      {
        success: false,
        message: "Date query parameter required",
      },
      { status: 400 },
    );

  const searchDate = new Date(date);
  const searchDateEnds = new Date(new Date(date).setHours(24));

  const availableSlotsOnDate = await db.query.slots.findMany({
    where: and(
      eq(slots.doctorId, doctorExists.id),
      eq(slots.status, "available"),
      gt(slots.startsAt, searchDate),
      lt(slots.endsAt, searchDateEnds),
    ),
  });

  const availableSlotsFormatted: ApiSlot[] = availableSlotsOnDate.map((s) => ({
    slotId: s.id,
    startsAt: s.startsAt,
    endsAt: s.endsAt,
    duration: s.duration,
    repeatingRuleId: s.repeatingSlotRuleId,
  }));

  let availableSlots: ApiSlot[] = [...availableSlotsFormatted];

  //find, generate rule slots and add to array
  const repeatSlotRules = await db.query.repeatingSlotRules.findMany({
    where: and(
      eq(repeatingSlotRules.doctorId, doctorExists.id),
      or(
        //if rule is weekly based ensure today is one of the days it should apply
        and(
          eq(repeatingSlotRules.repeatingType, "weekly"),
          arrayContains(repeatingSlotRules.repeatingWeekdays, [
            searchDate.getDay(),
          ]),
        ),
        //or get any daily rules
        eq(repeatingSlotRules.repeatingType, "daily"),
      ),
    ),
  });

  for (const repeatingRule of repeatSlotRules) {
    const ruleSlots = await generateSlotsFromRepeatingRule(repeatingRule);
    const formattedRuleSlots = ruleSlots.map((s) => ({
      slotId: null,
      ...s,
    }));
    const nonConflictingSlots = formattedRuleSlots.filter((s) => {
      const isConflicting =
        availableSlots.findIndex((eS) => {
          const today = new Date();

          const existingStartDate = new Date(today);
          existingStartDate.setHours(eS.startsAt.getHours());
          existingStartDate.setMinutes(eS.startsAt.getMinutes());

          const existingEndDate = new Date(today);
          existingEndDate.setHours(eS.endsAt.getHours());
          existingEndDate.setMinutes(eS.endsAt.getMinutes());

          const newStartDate = new Date(today);
          newStartDate.setHours(s.startsAt.getHours());
          newStartDate.setMinutes(s.startsAt.getMinutes());

          const newEndDate = new Date(today);
          newEndDate.setHours(s.endsAt.getHours());
          newEndDate.setMinutes(s.endsAt.getMinutes());

          const c =
            newStartDate.getTime() < existingEndDate.getTime() &&
            newEndDate.getTime() > existingStartDate.getTime();

          return c;
        }) === -1;

      return isConflicting;
    });

    availableSlots = [...availableSlots, ...nonConflictingSlots];
  }

  availableSlots = availableSlots.sort(
    (a, b) => b.startsAt.getTime() - a.startsAt.getTime(),
  );

  return NextResponse.json({
    success: true,
    slots: availableSlots,
  } as GetAvailableSlotsSuccessResponse);
};
