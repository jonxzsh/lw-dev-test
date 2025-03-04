import { z } from "zod";

export const CreateDoctorBodySchema = z.object({
  username: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
});
