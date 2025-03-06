import { eq } from "drizzle-orm";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import ErrorMessage from "~/app/_components/error";
import ManagePatientNav from "~/app/_components/patient/manage-patient/manage-patient-nav";
import { StyledH2, StyledText } from "~/app/_components/typography";
import { Button } from "~/components/ui/button";
import { db } from "~/server/db";
import { patients } from "~/server/db/schema";

const Layout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ patientId: string }>;
}) => {
  const { patientId } = await params;

  const patient = await db.query.patients.findFirst({
    where: eq(patients.id, patientId),
  });

  if (!patient) return <ErrorMessage>This patient doesn't exist</ErrorMessage>;

  return (
    <div className="flex flex-col gap-8">
      <Link href="/patient">
        <Button size="sm" variant="outline">
          <ArrowLeftIcon />
          Go Back
        </Button>
      </Link>
      <div className="flex flex-col gap-4">
        <StyledH2>
          Managing Patient - {patient.firstName} {patient.lastName}
        </StyledH2>
        <StyledText>Create a new booking or manage existing ones</StyledText>
      </div>
      <div className="flex w-full flex-col gap-4">
        <ManagePatientNav />
        {children}
      </div>
    </div>
  );
};

export default Layout;
