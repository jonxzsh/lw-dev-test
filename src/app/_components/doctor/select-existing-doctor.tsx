import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { DoctorType } from "~/lib/types";
import { StyledH4 } from "../typography";

const SelectExistingDoctor = ({
  doctors,
  selectedDoctor,
  setSelectedDoctor,
}: {
  doctors: DoctorType[];
  selectedDoctor: null | string;
  setSelectedDoctor: (state: null | string) => void;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <StyledH4>Existing Doctors</StyledH4>
      <div className="flex gap-2">
        <Select value={selectedDoctor ?? ""} onValueChange={setSelectedDoctor}>
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
        <Link href={`/doctor/${selectedDoctor}`}>
          <Button variant="outline" disabled={selectedDoctor === null}>
            Continue
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SelectExistingDoctor;
