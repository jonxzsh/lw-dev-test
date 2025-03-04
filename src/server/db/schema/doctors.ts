import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";
import { repeatingSlotRules } from "./repeatingSlotRules";
import { slots } from "./slots";

export const doctors = pgTable("doctors", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull()
    .primaryKey(),
  username: text("username"),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
});

export const doctorsRelations = relations(doctors, ({ many }) => ({
  slots: many(slots),
  repeatingSlotRules: many(repeatingSlotRules),
}));
