import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { doctors } from "./doctors";
import { patients } from "./patients";
import { slots } from "./slots";

export const bookings = pgTable("bookings", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  slotId: text("slot_id")
    .notNull()
    .references(() => slots.id),
  patientId: text("patient_id")
    .notNull()
    .references(() => patients.id),
  doctorId: text("doctor_id")
    .notNull()
    .references(() => doctors.id),
  reason: text("reason"),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const bookingsRelations = relations(bookings, ({ one }) => ({
  slot: one(slots, {
    fields: [bookings.slotId],
    references: [slots.id],
  }),
  patient: one(patients, {
    fields: [bookings.patientId],
    references: [patients.id],
  }),
  doctor: one(doctors, {
    fields: [bookings.doctorId],
    references: [doctors.id],
  }),
}));
