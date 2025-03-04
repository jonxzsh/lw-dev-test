import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { doctors } from "./doctors";

export const slotStatus = pgEnum("slot_status", ["available", "booked"]);

export const slots = pgTable("slots", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  doctorId: text("doctor_id")
    .notNull()
    .references(() => doctors.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: slotStatus("slot_status").default("available").notNull(),
});

export const slotsRelations = relations(slots, ({ one }) => ({
  doctor: one(doctors, {
    fields: [slots.doctorId],
    references: [doctors.id],
  }),
}));
