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
