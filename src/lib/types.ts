import { doctors, patients } from "~/server/db/schema";

export type DoctorType = typeof doctors.$inferSelect;

export interface GetDoctorsSuccessResponse {
  success: boolean;
  doctors: DoctorType[];
}

export interface CreateDoctorSuccessResponse {
  success: boolean;
  doctor: DoctorType;
}

export type PatientType = typeof patients.$inferSelect;

export interface GetPatientsSuccessResponse {
  success: boolean;
  patients: PatientType[];
}

export interface CreatePatientSuccessResponse {
  success: boolean;
  patient: PatientType;
}
