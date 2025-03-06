import { doctors } from "~/server/db/schema";

export type DoctorType = typeof doctors.$inferSelect;
export interface GetDoctorsSuccessResponse {
  success: boolean;
  doctors: DoctorType[];
}
