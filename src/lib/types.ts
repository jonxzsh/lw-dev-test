import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { doctors, patients } from "~/server/db/schema";

export type DoctorType = typeof doctors.$inferSelect;
export type PatientType = typeof patients.$inferSelect;

export const DoctorSchema = createSelectSchema(doctors);
export const PatientSchema = createSelectSchema(patients);

export const getDoctorsSuccessResponseSchema = z.object({
  success: z.boolean(),
  doctors: z.array(DoctorSchema),
});

export type GetDoctorsSuccessResponse = z.infer<
  typeof getDoctorsSuccessResponseSchema
>;

export const createDoctorSuccessResponseSchema = z.object({
  success: z.boolean(),
  doctor: DoctorSchema,
});

export type CreateDoctorSuccessResponse = z.infer<
  typeof createDoctorSuccessResponseSchema
>;

export const getPatientsSuccessResponseSchema = z.object({
  success: z.boolean(),
  patients: z.array(PatientSchema),
});

export type GetPatientsSuccessResponse = z.infer<
  typeof getPatientsSuccessResponseSchema
>;

export const createPatientSuccessResponseSchema = z.object({
  success: z.boolean(),
  patient: PatientSchema,
});

export type CreatePatientSuccessResponse = z.infer<
  typeof createPatientSuccessResponseSchema
>;

export type ApiSlot = {
  slotId: string | null;
  startsAt: Date | string;
  endsAt: Date | string;
  duration: string;
  repeatingRuleId: string | null;
};

export const apiSlotSchema = z.object({
  slotId: z.string().nullable(),
  startsAt: z.date().or(z.string()),
  endsAt: z.date().or(z.string()),
  duration: z.string(),
  repeatingRuleId: z.string().nullable(),
});

export const getAvailableSlotsSuccessResponseSchema = z.object({
  success: z.boolean(),
  slots: z.array(apiSlotSchema),
});

export type GetAvailableSlotsSuccessResponse = z.infer<
  typeof getAvailableSlotsSuccessResponseSchema
>;

export const bookSlotSuccessResponseSchema = z.object({
  success: z.boolean(),
});

export type BookSlotSuccessResponse = z.infer<
  typeof bookSlotSuccessResponseSchema
>;
