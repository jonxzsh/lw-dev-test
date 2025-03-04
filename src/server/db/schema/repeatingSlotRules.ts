import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import { integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core";
import { doctors } from "./doctors";

export const repeatingType = pgEnum("repeating_type", ["daily", "weekly"]);

export const repeatingSlotRules = pgTable("repeating_slot_rules", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  doctorId: text("doctor_id")
    .notNull()
    .references(() => doctors.id),
  //we store the hours, or days, that we should repeat the slots here:
  //for example, if repeating_type is daily we would store [13,14] for 1&2pm repeating
  repeatingValues: integer("repeating_values")
    .array()
    .notNull()
    .default(sql`'{}'::int[]`),
  repeatingType: repeatingType("repeating_type").notNull(),
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
