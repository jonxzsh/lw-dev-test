import { z } from "zod";

export const CreateSlotsBodySchema = z
  .object({
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
    duration: z.enum(["15m", "30m"]),
    repeating: z
      .object({
        repeating_type: z.enum(["daily", "weekly"]),
        repeating_weekdays: z.array(z.number().min(0).max(6)).optional(), //js Date object Wkdays (ex: 0 for sunday, 6 for sat)
      })
      .optional(),
  })
  .refine(
    (schema) => {
      if (schema.repeating) {
        if (
          schema.repeating.repeating_type === "weekly" &&
          !schema.repeating.repeating_weekdays
        )
          return false;
      }
      return true;
    },
    {
      message:
        'Repeating weekly must pass "repeating_weekdays" in the repeating object',
      path: ["repeating", "repeating_weekdays"],
    },
  );

export const BookSlotBodySchema = z
  .object({
    slot_type: z.enum(["present_in_database", "rule_generated"]),
    slot_id: z.string().optional(),
    rule_slot: z
      .object({
        rule_id: z.string(),
        starts_at: z.string().datetime(),
        ends_at: z.string().datetime(),
      })
      .optional(),
    booking_reason: z.string().optional(),
  })
  .refine(
    (schema) => {
      if (schema.slot_type === "present_in_database" && !schema.slot_id)
        return false;
      return true;
    },
    {
      message: '"slot_id" must be provided for slot_type "present_in_database"',
      path: ["slot_id"],
    },
  )
  .refine(
    (schema) => {
      if (schema.slot_type === "rule_generated" && !schema.rule_slot)
        return false;
      return true;
    },
    {
      message:
        '"rule_slot" object must be provided for slot_type "rule_generated"',
      path: ["rule_slot"],
    },
  );
