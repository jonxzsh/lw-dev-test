"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { getDoctorsSuccessResponseSchema, type DoctorType } from "~/lib/types";
import CreateNewDoctor from "../_components/doctor/create-new-doctor";
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
      setLoading(true);
      const response = await fetch("/api/doctors", {
        credentials: "include",
      });

      if (!response.ok)
        throw new Error(
          `Received invalid API response: ${await response.text()}`,
        );

      const rawJson: unknown = await response.json();
      const data = getDoctorsSuccessResponseSchema.parse(rawJson);

      setDoctors(data.doctors);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      setError(String(e));
    }
  };

  useEffect(() => {
    void fetchExistingDoctors();
  }, []);

  if (error !== null) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (loading) return <PageLoadingIndicator />;

  return (
    <div className="flex flex-col gap-8">
      <Link href="/">
        <Button size="sm" variant="outline">
          <ArrowLeftIcon />
          Go Back
        </Button>
      </Link>
      <div className="flex flex-col">
        <StyledH2>Select a doctor profile to continue</StyledH2>
        <StyledText>
          You can select a doctor profile below - or create a new one
        </StyledText>
      </div>
      <div className="flex flex-col gap-4">
        <Separator />
        <SelectExistingDoctor
          doctors={doctors}
          selectedDoctor={selectedDoctor}
          setSelectedDoctor={setSelectedDoctor}
        />
        <Separator />
        <CreateNewDoctor refresh={() => fetchExistingDoctors()} />
      </div>
    </div>
  );
};

export default Page;
