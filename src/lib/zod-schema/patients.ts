import { z } from "zod";

export const CreatePatientBodySchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
});
