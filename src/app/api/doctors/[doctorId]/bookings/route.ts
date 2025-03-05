import { and, eq, gt, lt } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { bookings, doctors, patients, slots } from "~/server/db/schema";

type ApiSlot = {
  slotId: string | null;
  startsAt: Date;
  endsAt: Date;
  duration: string;
  repeatingRuleId: string | null;
};

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ doctorId: string }> },
) => {
  const { doctorId } = await params;

  const doctorExists = await db.query.doctors.findFirst({
    where: eq(doctors.id, doctorId),
  });
  if (!doctorExists)
    return NextResponse.json(
      {
        success: false,
        message: "No doctor exists with this ID",
      },
      { status: 404 },
    );

  const searchParams = req.nextUrl.searchParams;
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");

  if (!startDate || typeof startDate !== "string")
    return NextResponse.json(
      {
        success: false,
        message: "Start Date query parameter required",
      },
      { status: 400 },
    );

  if (!endDate || typeof endDate !== "string")
    return NextResponse.json(
      {
        success: false,
        message: "Start Date query parameter required",
      },
      { status: 400 },
    );

  const searchDate = new Date(startDate);
  const searchDateEnds = new Date(endDate);

  const bookedSlotsOnDates = await db
    .select({ bookings: bookings, slots: slots, patients: patients })
    .from(bookings)
    .innerJoin(
      slots,
      and(
        eq(bookings.slotId, slots.id),
        gt(slots.startsAt, searchDate),
        lt(slots.endsAt, searchDateEnds),
      ),
    )
    .innerJoin(patients, eq(bookings.patientId, patients.id));

  const bookingObjects = bookedSlotsOnDates.map((b) => {
    return {
      ...b.bookings,
      slot: b.slots,
      patient: b.patients,
    };
  });

  return NextResponse.json({ success: true, bookings: bookingObjects });
};
