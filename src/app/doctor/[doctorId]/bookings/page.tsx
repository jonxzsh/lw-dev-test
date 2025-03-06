import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { bookings } from "~/server/db/schema";

const Page = async ({ params }: { params: Promise<{ doctorId: string }> }) => {
  const { doctorId } = await params;

  const doctorBookings = await db.query.bookings.findMany({
    where: eq(bookings.doctorId, doctorId),
    with: {
      slot: true,
      patient: true,
    },
  });

  return (
    <div className="flex w-96 flex-col gap-2">
      {doctorBookings.map((booking, _) => (
        <div
          className="flex flex-col gap-1 rounded-md border border-border p-4"
          key={booking.id}
        >
          <div className="text-sm tracking-tight">
            Appointment with {booking.patient.firstName}{" "}
            {booking.patient.lastName}
          </div>
          <div className="text-xs">
            Starts at {booking.slot.startsAt.toLocaleString()} •{" "}
            {booking.slot.duration}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Page;
