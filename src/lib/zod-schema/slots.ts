import { z } from "zod";

export const CreateSlotsBodySchema = z
  .object({
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
    duration: z.enum(["15m", "30m"]),
    repeating: z
      .object({
        repeating_type: z.enum(["daily", "weekly"]),
        repeating_weekdays: z.array(z.number()).optional(),
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
