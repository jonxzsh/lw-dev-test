import { type NextRequest, NextResponse } from "next/server";
import { env } from "~/env";
import { CreatePatientBodySchema } from "~/lib/zod-schema/patients";
import { db } from "~/server/db";
import { patients } from "~/server/db/schema";

export const GET = async () => {
  const patients = await db.query.patients.findMany();

  return NextResponse.json({ success: true, patients });
};

export const POST = async (req: NextRequest) => {
  let body;
  try {
    const bodyJson: unknown = await req.json();
    body = CreatePatientBodySchema.parse(bodyJson);
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

  const insertedPatients = await db
    .insert(patients)
    .values({
      firstName: body.first_name,
      lastName: body.last_name,
    })
    .returning();
  const patient = insertedPatients.at(0);
  if (!patient)
    return NextResponse.json(
      {
        success: false,
        message: "Internal Database Error",
      },
      { status: 500 },
    );

  return NextResponse.json({
    success: true,
    patient,
  });
};
