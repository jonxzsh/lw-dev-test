import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { bookings } from "~/server/db/schema";

const Page = async ({ params }: { params: Promise<{ patientId: string }> }) => {
  const { patientId } = await params;

  const patientBookings = await db.query.bookings.findMany({
    where: eq(bookings.patientId, patientId),
    with: {
      slot: true,
      doctor: true,
    },
  });

  return (
    <div className="flex w-96 flex-col gap-2">
      {patientBookings.map((booking, _) => (
        <div
          className="flex flex-col gap-1 rounded-md border border-border p-4"
          key={booking.id}
        >
          <div className="text-sm tracking-tight">
            Appointment with {booking.doctor.firstName}{" "}
            {booking.doctor.lastName}
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
