"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlusIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { CreatePatientSuccessResponse } from "~/lib/types";
import { CreatePatientBodySchema } from "~/lib/zod-schema/patients";
import { StyledH4 } from "../typography";

const CreateNewPatient = ({ refresh }: { refresh: () => void }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuccessIndicator, setShowSuccessIndicator] =
    useState<boolean>(false);

  const form = useForm<z.infer<typeof CreatePatientBodySchema>>({
    resolver: zodResolver(CreatePatientBodySchema),
  });

  const onSubmit = async (values: z.infer<typeof CreatePatientBodySchema>) => {
    try {
      setLoading(true);

      const response = await fetch("/api/patients", {
        method: "POST",
        body: JSON.stringify(values),
        credentials: "include",
      });

      if (!response.ok)
        throw new Error(`API returned error: ${await response.text()}`);

      const data: CreatePatientSuccessResponse = await response.json();

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
        <StyledH4>Create New Patient</StyledH4>
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
        <Button
          className="w-full"
          type="submit"
          disabled={loading || showSuccessIndicator}
        >
          {showSuccessIndicator ? "Success" : "Create Patient"}
          <UserPlusIcon />
        </Button>
      </form>
    </Form>
  );
};

export default CreateNewPatient;
