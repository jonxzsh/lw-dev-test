import { eq, or } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "~/env";
import { CreateDoctorBodySchema } from "~/lib/zod-schema/doctor";
import { db } from "~/server/db";
import { doctors } from "~/server/db/schema";

export const GET = async (req: NextRequest) => {
  const doctors = await db.query.doctors.findMany();

  return NextResponse.json({ success: true, doctors });
};

export const POST = async (req: NextRequest) => {
  let body;
  try {
    const bodyJson: unknown = await req.json();
    body = CreateDoctorBodySchema.parse(bodyJson);
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        message: "Bad Request",
        error: env.NODE_ENV === "development" ? e : null,
      },
      { status: 500 },
    );
  }

  const doctorExists = await db.query.doctors.findFirst({
    where: or(
      eq(doctors.email, body.email),
      eq(doctors.username, body.username),
    ),
  });
  if (doctorExists) {
    const doctorExistsByEmail = doctorExists.email === body.email;

    return NextResponse.json(
      {
        success: false,
        message: `A doctor already exists with this ${doctorExistsByEmail ? "email" : "username"}`,
      },
      { status: 400 },
    );
  }

  const insertedDoctor = await db
    .insert(doctors)
    .values({
      username: body.username,
      email: body.email,
      firstName: body.first_name,
      lastName: body.last_name,
    })
    .returning();
  const doctor = insertedDoctor.at(0);
  if (!doctor)
    return NextResponse.json(
      {
        success: false,
        message: "Internal Database Error",
      },
      { status: 500 },
    );

  return NextResponse.json({
    success: true,
    doctor,
  });
};
