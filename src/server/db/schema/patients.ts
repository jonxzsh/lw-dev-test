import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import { slots } from "./slots";

export const patients = pgTable("patients", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
});

export const patientsRelations = relations(patients, ({ many }) => ({
  slot: many(slots),
}));
