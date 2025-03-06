"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlusIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { CreateDoctorBodySchema } from "~/lib/zod-schema/doctor";
import { StyledH4 } from "../typography";

const CreateNewDoctor = ({ refresh }: { refresh: () => void }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuccessIndicator, setShowSuccessIndicator] =
    useState<boolean>(false);

  const form = useForm<z.infer<typeof CreateDoctorBodySchema>>({
    resolver: zodResolver(CreateDoctorBodySchema),
  });

  const onSubmit = async (values: z.infer<typeof CreateDoctorBodySchema>) => {
    try {
      setLoading(true);

      const response = await fetch("/api/doctors", {
        method: "POST",
        body: JSON.stringify(values),
        credentials: "include",
      });

      if (!response.ok)
        throw new Error(`API returned error: ${await response.text()}`);

      setLoading(false);
      setShowSuccessIndicator(true);
      refresh();
    } catch (e) {
      setLoading(false);
      console.log(e);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-[350px] space-y-4"
      >
        <StyledH4>Create New Doctor</StyledH4>
        <div className="flex w-full justify-between gap-2">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className="w-full"
          type="submit"
          disabled={loading || showSuccessIndicator}
        >
          {showSuccessIndicator ? "Success" : "Create Doctor"}
          <UserPlusIcon />
        </Button>
      </form>
    </Form>
  );
};

export default CreateNewDoctor;
