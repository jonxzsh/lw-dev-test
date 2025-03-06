"use client";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { DoctorType } from "~/lib/types";

const ManageDoctorNav = ({ doctor }: { doctor: DoctorType }) => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        value={pathname.split("/").at(-1)}
        onValueChange={(v) => router.push(v)}
      >
        <TabsList>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="slots">Slots</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default ManageDoctorNav;
