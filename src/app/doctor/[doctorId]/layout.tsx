import { eq } from "drizzle-orm";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import ManageDoctorNav from "~/app/_components/doctor/manage-doctor/manage-doctor-nav";
import ErrorMessage from "~/app/_components/error";
import { StyledH2, StyledText } from "~/app/_components/typography";
import { Button } from "~/components/ui/button";
import { db } from "~/server/db";
import { doctors } from "~/server/db/schema";

const Layout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ doctorId: string }>;
}) => {
  const { doctorId } = await params;

  const doctor = await db.query.doctors.findFirst({
    where: eq(doctors.id, doctorId),
  });

  if (!doctor) return <ErrorMessage>This doctor doesn't exist</ErrorMessage>;

  return (
    <div className="flex flex-col gap-8">
      <Link href="/doctor">
        <Button size="sm" variant="outline">
          <ArrowLeftIcon />
          Go Back
        </Button>
      </Link>
      <div className="flex flex-col gap-4">
        <StyledH2>
          Managing Doctor - {doctor.username} ({doctor.firstName}{" "}
          {doctor.lastName})
        </StyledH2>
        <StyledText>Manage bookings and slots for {doctor.username}</StyledText>
      </div>
      <div className="flex flex-col gap-4">
        <ManageDoctorNav doctor={doctor} />
        {children}
      </div>
    </div>
  );
};

export default Layout;
