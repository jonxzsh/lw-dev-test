import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { doctors } from "./doctors";
import { repeatingSlotRules } from "./repeatingSlotRules";

export const slotStatus = pgEnum("slot_status", ["available", "booked"]);
export const slotDuration = pgEnum("slot_duration", ["15m", "30m"]);

export const slots = pgTable("slots", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  doctorId: text("doctor_id")
    .notNull()
    .references(() => doctors.id),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at").notNull(),
  status: slotStatus("slot_status").default("available").notNull(),
  duration: slotDuration("slot_duration").notNull(),
  repeatingSlotRuleId: text("repeating_slot_rule_id"),
});

export const slotsRelations = relations(slots, ({ one }) => ({
  doctor: one(doctors, {
    fields: [slots.doctorId],
    references: [doctors.id],
  }),
  repeatingSlotRule: one(repeatingSlotRules, {
    fields: [slots.repeatingSlotRuleId],
    references: [repeatingSlotRules.id],
  }),
}));
