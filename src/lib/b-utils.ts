import { and, eq, gt, lt } from "drizzle-orm";
import { db } from "~/server/db";
import { slots, type repeatingSlotRules } from "~/server/db/schema";

export const difMins = (a: Date, b: Date) =>
  Math.round((a.getTime() - b.getTime()) / 60000);

export const minsToMs = (mins: number) => mins * 60000;

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
      const slotConflict = await db.query.slots.findFirst({
        where: and(
          eq(slots.doctorId, repeatingRule.doctorId),
          lt(slots.startsAt, slot.endsAt),
          gt(slots.endsAt, slot.startsAt),
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
