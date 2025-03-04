import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { text } from "drizzle-orm/pg-core";
import { createTable } from "../schema";
import { slots } from "./slots";

export const patients = createTable("patients", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
});

export const patientsRelations = relations(patients, ({ one, many }) => ({
  slot: many(slots),
}));
