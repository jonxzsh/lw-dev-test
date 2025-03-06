"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { GetPatientsSuccessResponse, PatientType } from "~/lib/types";
import ErrorMessage from "../_components/error";
import { PageLoadingIndicator } from "../_components/loading-indicator";
import CreateNewPatient from "../_components/patient/create-new-patient";
import SelectExistingPatient from "../_components/patient/select-existing-patient";
import { StyledH2, StyledText } from "../_components/typography";

const Page = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<null | string>(null);
  const [patients, setPatients] = useState<PatientType[]>([]);

  const [selectedPatient, setSelectedPatient] = useState<null | string>(null);

  const fetchExistingPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/patients", {
        credentials: "include",
      });

      if (!response.ok)
        throw new Error(
          `Received invalid API response: ${await response.text()}`,
        );

      const data: GetPatientsSuccessResponse = await response.json();

      setPatients(data.patients);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      setError(String(e));
    }
  };

  useEffect(() => {
    fetchExistingPatients();
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
        <StyledH2>Select a patient profile to continue</StyledH2>
        <StyledText>
          You can select a patient profile below - or create a new one
        </StyledText>
      </div>
      <div className="flex flex-col gap-4">
        <Separator />
        <SelectExistingPatient
          patients={patients}
          selectedPatient={selectedPatient}
          setSelectedPatient={setSelectedPatient}
        />
        <Separator />
        <CreateNewPatient refresh={() => fetchExistingPatients()} />
      </div>
    </div>
  );
};

export default Page;
