import { and, eq } from "drizzle-orm";
import { Weekdays } from "~/lib/utils";
import { db } from "~/server/db";
import { repeatingSlotRules, slots } from "~/server/db/schema";

const Page = async ({ params }: { params: Promise<{ doctorId: string }> }) => {
  const { doctorId } = await params;

  const doctorSlots = await db.query.slots.findMany({
    where: and(eq(slots.doctorId, doctorId), eq(slots.status, "available")),
  });

  const repeatingRules = await db.query.repeatingSlotRules.findMany({
    where: eq(repeatingSlotRules.doctorId, doctorId),
  });

  return (
    <div className="flex justify-between">
      <div className="flex w-96 flex-col gap-2">
        {doctorSlots.map((slot, _) => (
          <div
            className="flex flex-col gap-1 rounded-md border border-border p-4"
            key={slot.id}
          >
            <div className="text-sm tracking-tight">
              {slot.status === "available" ? "Available" : "Booked"} slot
            </div>
            <div className="text-xs">
              Starts at {slot.startsAt.toLocaleString()} • {slot.duration}
            </div>
          </div>
        ))}
        {repeatingRules.map((rule, _) => (
          <div
            className="flex flex-col gap-1 rounded-md border border-border p-4"
            key={rule.id}
          >
            <div className="text-sm tracking-tight">
              Repeating{" "}
              {rule.repeatingType.at(0)?.toUpperCase() +
                rule.repeatingType.slice(1)}{" "}
              {rule.repeatingType === "weekly" && rule.repeatingWeekdays
                ? `on ${rule.repeatingWeekdays.map((d) => Weekdays[d]).join(", ")}`
                : null}
            </div>
            <div className="text-xs">
              {rule.repeatingDuration} appointments between{" "}
              {rule.startTime.getHours()}:00 - {rule.endTime.getHours()}:00
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
