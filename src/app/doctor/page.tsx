"use client";

import { useEffect, useState } from "react";
import { DoctorType, GetDoctorsSuccessResponse } from "~/lib/types";
import SelectExistingDoctor from "../_components/doctor/select-existing-doctor";
import ErrorMessage from "../_components/error";
import { PageLoadingIndicator } from "../_components/loading-indicator";
import { StyledH2, StyledText } from "../_components/typography";

const Page = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<null | string>(null);
  const [doctors, setDoctors] = useState<DoctorType[]>([]);

  const [selectedDoctor, setSelectedDoctor] = useState<null | string>(null);

  const fetchExistingDoctors = async () => {
    try {
      const response = await fetch("/api/doctors", {
        credentials: "include",
      });

      if (!response.ok)
        throw new Error(
          `Received invalid API response: ${await response.text()}`,
        );

      const data: GetDoctorsSuccessResponse = await response.json();

      setDoctors(data.doctors);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      setError(String(e));
    }
  };

  useEffect(() => {
    fetchExistingDoctors();
  }, []);

  if (error !== null) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (loading) return <PageLoadingIndicator />;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col">
        <StyledH2>Select a doctor profile to continue</StyledH2>
        <StyledText>
          You can select a doctor profile below - or create a new one
        </StyledText>
      </div>
      <div className="flex w-full justify-between">
        <SelectExistingDoctor
          doctors={doctors}
          selectedDoctor={selectedDoctor}
          setSelectedDoctor={setSelectedDoctor}
        />
      </div>
    </div>
  );
};

export default Page;
