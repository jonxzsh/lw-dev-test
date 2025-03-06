"use client";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";

const ManagePatientNav = () => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        value={pathname.split("/").at(-1)}
        onValueChange={(v) => router.push(v)}
      >
        <TabsList>
          <TabsTrigger value="book">New Booking</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default ManagePatientNav;
