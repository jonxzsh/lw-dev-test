"use client";

import { RotateCcwIcon, SearchIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type z } from "zod";
import DatePicker from "~/app/_components/date-picker";
import ErrorMessage from "~/app/_components/error";
import { StyledH4 } from "~/app/_components/typography";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  getAvailableSlotsSuccessResponseSchema,
  getDoctorsSuccessResponseSchema,
  type ApiSlot,
  type DoctorType,
} from "~/lib/types";
import { type BookSlotBodySchema } from "~/lib/zod-schema/slots";

const Page = () => {
  const router = useRouter();
  const params = useParams<{ patientId: string }>();
  const { patientId } = params;

  const [showSearch, setShowSearch] = useState<boolean>(true);
  const [selectedDoctor, setSelectedDoctor] = useState<null | string>(null);
  const [selectedDate, setSelectedDate] = useState<undefined | Date>(undefined);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

  const [availableSlots, setAvailableSlots] = useState<ApiSlot[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<null | string>(null);
  const [doctors, setDoctors] = useState<DoctorType[]>([]);

  const fetchExistingDoctors = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/doctors", {
        credentials: "include",
      });

      if (!response.ok)
        throw new Error(
          `Received invalid API response: ${await response.text()}`,
        );

      const rawJson: unknown = await response.json();
      const data = getDoctorsSuccessResponseSchema.parse(rawJson);

      setDoctors(data.doctors);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      setError(String(e));
    }
  };

  useEffect(() => {
    void fetchExistingDoctors();
  }, []);

  const fetchAvailableSlots = async () => {
    try {
      setSearchLoading(true);
      const response = await fetch(
        `/api/doctors/${selectedDoctor}/available-slots?date=${selectedDate?.toISOString()}`,
        {
          credentials: "include",
        },
      );

      if (!response.ok)
        throw new Error(
          `Received invalid API response: ${await response.text()}`,
        );

      const rawJson: unknown = await response.json();
      const data = getAvailableSlotsSuccessResponseSchema.parse(rawJson);

      setAvailableSlots(data.slots);
      setSearchLoading(false);
      setShowSearch(false);
    } catch (e) {
      setSearchLoading(false);
      setError(String(e));
    }
  };

  const bookSlot = async (requestBody: object) => {
    try {
      setLoading(true);

      const response = await fetch(`/api/patients/${patientId}/book-slot`, {
        method: "POST",
        body: JSON.stringify(requestBody),
        credentials: "include",
      });

      if (!response.ok) return setError(`API Error: ${await response.text()}`);

      router.push(`/patient/${patientId}/bookings`);
    } catch (e) {
      setLoading(false);
      setError(String(e));
    }
  };

  const searchAgain = () => {
    setShowSearch(true);
    setAvailableSlots([]);
  };

  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  return (
    <div className="flex w-full flex-col gap-2">
      {showSearch && (
        <div className="flex w-[500px] flex-col gap-4 rounded-md border border-border p-4">
          <StyledH4>Search for available appointments</StyledH4>
          <div className="flex flex-col gap-2">
            <Label>Doctor</Label>
            <Select
              value={selectedDoctor ?? ""}
              onValueChange={setSelectedDoctor}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select a doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((d, _) => (
                  <SelectItem value={d.id} key={`s-dropdown-${d.id}`}>
                    {d.username} ({d.firstName} {d.lastName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Date</Label>
            <DatePicker value={selectedDate} onValueChange={setSelectedDate} />
          </div>
          <Button
            className="w-fit"
            disabled={
              loading ||
              searchLoading ||
              selectedDoctor === null ||
              selectedDate === undefined
            }
            onClick={() => fetchAvailableSlots()}
          >
            <SearchIcon />
            Find Appointments
          </Button>
        </div>
      )}
      {!showSearch && (
        <Button
          className="w-fit"
          variant="outline"
          size="sm"
          onClick={() => searchAgain()}
        >
          <RotateCcwIcon />
          Search Again
        </Button>
      )}

      <div className="grid grid-cols-3 gap-4">
        {availableSlots.map((slot, index) => (
          <div
            className="flex flex-col gap-1 rounded-md border border-border p-4 hover:cursor-pointer hover:bg-accent hover:text-accent-foreground"
            key={`a-slot-${index}`}
            onClick={() => {
              const requestObj: z.infer<typeof BookSlotBodySchema> = {
                slot_type: slot.repeatingRuleId
                  ? "rule_generated"
                  : "present_in_database",
              };

              if (
                requestObj.slot_type === "present_in_database" &&
                slot.slotId
              ) {
                requestObj.slot_id = slot.slotId;
              } else if (
                requestObj.slot_type === "rule_generated" &&
                slot.repeatingRuleId
              ) {
                requestObj.rule_slot = {
                  rule_id: slot.repeatingRuleId,
                  starts_at: new Date(slot.startsAt).toISOString(),
                  ends_at: new Date(slot.endsAt).toISOString(),
                };
              }

              void bookSlot(requestObj);
            }}
          >
            <div className="text-sm tracking-tight">
              {slot.duration} Appointment
            </div>
            <div className="text-xs">
              {new Date(slot.startsAt).toLocaleTimeString()} -{" "}
              {new Date(slot.endsAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
