import { and, arrayContains, eq, gt, lt, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { generateSlotsFromRepeatingRule } from "~/lib/utils";
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

  for (let i = 0; i < repeatSlotRules.length; i++) {
    const repeatingRule = repeatSlotRules[i];
    if (!repeatingRule) continue;

    const ruleSlots = await generateSlotsFromRepeatingRule(repeatingRule);
    const formattedRuleSlots = ruleSlots.map((s) => ({
      slotId: null,
      ...s,
    }));
    availableSlots = [...availableSlots, ...formattedRuleSlots];
  }

  return NextResponse.json({ success: true, availableSlots });
};
