import { and, eq, gt, lt, sql } from "drizzle-orm";
import { db } from "~/server/db";
import { slots, type repeatingSlotRules } from "~/server/db/schema";

export const difMins = (a: Date, b: Date) =>
  Math.round((a.getTime() - b.getTime()) / 60000);

export const minsToMs = (mins: number) => mins * 60000;

export const msSinceDayStart = (v: Date) => {
  const c = new Date(v); //to stop js overwriting on setHours
  return v.getTime() - c.setHours(0, 0, 0, 0);
};

export type RuleGeneratedSlot = {
  startsAt: Date;
  endsAt: Date;
  duration: string;
  repeatingRuleId: string;
};

export const generateSlotsFromRepeatingRule = async (
  repeatingRule: typeof repeatingSlotRules.$inferSelect,
) => {
  const durationMins = repeatingRule.repeatingDuration === "15m" ? 15 : 30;
  const startTime = new Date(repeatingRule.startTime);
  const endTime = new Date(repeatingRule.endTime);

  const minsBetween = difMins(endTime, startTime);
  const totalSlots = Math.round(minsBetween / durationMins);

  const slotObjects = Array.from({
    length: totalSlots,
  }).map((_, index) => {
    const startsAt = new Date(
      startTime.getTime() + minsToMs(index * durationMins),
    );
    const endsAt = new Date(startsAt.getTime() + minsToMs(durationMins));

    return {
      startsAt,
      endsAt,
      duration: repeatingRule.repeatingDuration,
      repeatingRuleId: repeatingRule.id,
    };
  });

  const ensuredSlots = await Promise.all(
    slotObjects.map(async (slot) => {
      const slotStartTime = slot.startsAt.toISOString().substring(11, 19);
      const slotEndTime = slot.endsAt.toISOString().substring(11, 19);

      const slotConflict = await db.query.slots.findFirst({
        where: and(
          eq(slots.doctorId, repeatingRule.doctorId),
          lt(
            sql`CAST(${slots.startsAt} AS time)`,
            sql`CAST(${slotEndTime} AS time)`,
          ),
          gt(
            sql`CAST(${slots.endsAt} AS time)`,
            sql`CAST(${slotStartTime} AS time)`,
          ),
        ),
      });
      if (slotConflict) return false;
      return slot;
    }),
  );
  const generatedSlots: RuleGeneratedSlot[] = ensuredSlots.filter(
    (s) => s !== false,
  );

  return generatedSlots;
};
