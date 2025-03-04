import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { doctors } from "./doctors";

export const repeatingType = pgEnum("repeating_type", ["daily", "weekly"]);
export const repeatingSlotDuration = pgEnum("slot_duration", ["15m", "30m"]);

export const repeatingSlotRules = pgTable("repeating_slot_rules", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  doctorId: text("doctor_id")
    .notNull()
    .references(() => doctors.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  repeatingType: repeatingType("repeating_type").notNull(),
  repeatingDuration: repeatingSlotDuration("repeating_slot_duration").notNull(),
  repeatingWeekdays: integer("repeating_weekdays").array(),
});

export const repeatingSlotRulesRelations = relations(
  repeatingSlotRules,
  ({ one }) => ({
    doctor: one(doctors, {
      fields: [repeatingSlotRules.doctorId],
      references: [doctors.id],
    }),
  }),
);
