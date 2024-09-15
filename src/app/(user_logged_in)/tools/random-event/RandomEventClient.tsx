"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import ClassSelect from "~/app/(user_logged_in)/classes/components/ClassesSelect";
import GroupsSelect from "~/app/(user_logged_in)/classes/components/GroupsSelect";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { useToast } from "~/components/ui/use-toast";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { assignerOptions, classesOptions } from "~/app/api/queryOptions";
import type { Assigner, TeacherCourse } from "~/server/db/types";
import DescriptionCollapsible from "./components/Description";
import CaseStudyCollapsible from "./components/CaseStudy";

const runAssignerSchema = z.object({
  classId: z.string().min(1, "Class is required"),
  selectedGroups: z.array(z.string()),
});

type RunAssignerFormData = z.infer<typeof runAssignerSchema>;

// export type AssignerResult = {
//   success: boolean;
//   message?: string;
// };

export default function RandomEventClient() {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [submitError, setSubmitError] = useState<string | null | undefined>(
    null,
  );
  const { toast } = useToast();

  const queryClient = useQueryClient();
  const { data: assigners } = useSuspenseQuery(assignerOptions);
  const { data: classesData } = useSuspenseQuery(classesOptions);

  const handleEventCreated = async () => {
    try {
      await queryClient.invalidateQueries({
        queryKey: assignerOptions.queryKey,
      });
    } catch (error) {
      console.error("Error invalidating queries:", error);
      toast({
        title: "Error",
        description: "Failed to refresh assigner list. Please try again.",
        variant: "destructive",
      });
    }
  };

  const form = useForm<RunAssignerFormData>({
    resolver: zodResolver(runAssignerSchema),
    defaultValues: {
      classId: "",
      selectedGroups: [],
    },
  });

  const onSubmit = async (data: RunAssignerFormData) => {
    try {
      setIsRunning(true);
      setSubmitError(null);

      const classData: TeacherCourse | undefined =
        classesData.find((i) => i.class_id === data.classId) ?? undefined;
      if (!classData) return "Class data is undefined";
      //   const result: AssignerResult = await roundRobinAssigner(
      //     classData,
      //     assignerData,
      //     data.selectedGroups,
      //   );
      //   if (result?.success) {
      //     setAssignedData(result?.data);
      //   } else {
      //     setSubmitError(result?.message);
      //   }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
      console.error("Error submitting students:", error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl space-y-8 p-4">
      <div className="space-y-6">
        <div className="space-y-4">
          <CaseStudyCollapsible />
          <DescriptionCollapsible />
        </div>
        <div className="rounded-lg bg-background p-6 shadow-md">
          <h2 className="mb-2 text-2xl font-bold">Random Event</h2>
          <h3 className="mb-4 text-base">Roll a random event for the day!</h3>
          {/* Create Random Event goes here */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <ClassSelect
                      onClassSelect={(value) => {
                        field.onChange(value);
                        setSelectedClassId(value);
                      }}
                      classes={classesData}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="selectedGroups"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Groups</FormLabel>
                    <GroupsSelect
                      selectedClassId={selectedClassId}
                      onGroupsSelect={(values) => field.onChange(values)}
                      classes={classesData}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              {submitError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" disabled={isRunning} className="w-full">
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>Roll an event</>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
