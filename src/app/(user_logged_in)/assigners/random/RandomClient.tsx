"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import AssignerDialog from "../components/CreateAssignerDialog";
import AssignerSelect from "../components/AssignerSelect";
import ClassSelect from "~/app/(user_logged_in)/classes/components/ClassesSelect";
import GroupsSelect from "~/app/(user_logged_in)/classes/components/GroupsSelect";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "~/components/ui/use-toast";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { PDFGenerator, type AssignedData } from "../components/PDF";
import { runRandomAssigner } from "./actions";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { assignerOptions, classesOptions } from "~/app/api/queryOptions";
import { CaseStudyCollapsible } from "./CaseStudy";
import { DescriptionCollapsible } from "./Description";

const runAssignerSchema = z.object({
  assignerId: z.string().min(1, "Assigner is required"),
  classId: z.string().min(1, "Class is required"),
  selectedGroups: z.array(z.string()),
});

type RunAssignerFormData = z.infer<typeof runAssignerSchema>;

type AssignerResult = {
  success: boolean;
  data?: AssignedData;
  message?: string;
};

export default function RandomClient() {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [assignedData, setAssignedData] = useState<
    AssignedData | null | undefined
  >(null);
  const [submitError, setSubmitError] = useState<string | null | undefined>(
    null,
  );
  const { userId } = useAuth();
  const { toast } = useToast();

  const queryClient = useQueryClient();
  const { data: assigners } = useSuspenseQuery(assignerOptions);
  const { data: classesData } = useSuspenseQuery(classesOptions);

  const handleAssignerCreated = async () => {
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
      assignerId: "",
      classId: "",
      selectedGroups: [],
    },
  });

  const onSubmit = async (data: RunAssignerFormData) => {
    try {
      setIsRunning(true);
      setSubmitError(null);
      setAssignedData(null);
      const result = (await runRandomAssigner(
        userId,
        data.classId,
        data.assignerId,
        data.selectedGroups,
      )) as AssignerResult;
      if (result?.success) {
        setAssignedData(result?.data);
      } else {
        setSubmitError(result?.message);
      }
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
          <h2 className="mb-2 text-2xl font-bold">Random Assigner</h2>
          <h3 className="mb-4 text-base">
            Randomly assign students to all the fungible things!
          </h3>
          <AssignerDialog onAssignerCreated={handleAssignerCreated} />
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="assignerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigner</FormLabel>
                    <AssignerSelect
                      onAssignerSelect={(value) => field.onChange(value)}
                      assigners={assigners}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                  <>Run Assigner</>
                )}
              </Button>
            </form>
          </Form>
          {assignedData && (
            <div className="mt-4">
              <PDFGenerator data={assignedData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
