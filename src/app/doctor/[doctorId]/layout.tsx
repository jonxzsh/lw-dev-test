import { eq } from "drizzle-orm";
import ManageDoctorNav from "~/app/_components/doctor/manage-doctor/manage-doctor-nav";
import ErrorMessage from "~/app/_components/error";
import { StyledH2, StyledText } from "~/app/_components/typography";
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
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
