import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { PatientType } from "~/lib/types";
import { StyledH4 } from "../typography";

const SelectExistingPatient = ({
  patients,
  selectedPatient,
  setSelectedPatient,
}: {
  patients: PatientType[];
  selectedPatient: null | string;
  setSelectedPatient: (state: null | string) => void;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <StyledH4>Existing Patients</StyledH4>
      <div className="flex gap-2">
        <Select
          value={selectedPatient ?? ""}
          onValueChange={setSelectedPatient}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select a patient" />
          </SelectTrigger>
          <SelectContent>
            {patients.map((p, _) => (
              <SelectItem value={p.id} key={`s-dropdown-${p.id}`}>
                {p.firstName} {p.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Link href={`/patient/${selectedPatient}/book`}>
          <Button variant="default" disabled={selectedPatient === null}>
            Continue
            <ArrowRightIcon />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SelectExistingPatient;
