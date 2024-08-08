"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ContentLayout } from "~/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
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
import { runRandomAssigner } from "./actions";
import { useAuth } from "@clerk/nextjs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useToast } from "~/components/ui/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { PDFGenerator, type AssignedData } from "../components/PDF";

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

export default function RandomAssignerPage() {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [assignedData, setAssignedData] = useState<
    AssignedData | null | undefined
  >(null);
  const [submitError, setSubmitError] = useState<string | null | undefined>(
    null,
  );
  const { userId } = useAuth();
  const { toast } = useToast();
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
        // data is returned here, now need to print a PDF of the data as a table
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
    <ContentLayout title="Assigner">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Assigner</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Round-Robin</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mt-5 flex w-full flex-col items-center justify-center gap-4">
        <div className="flex grid-cols-2 flex-col gap-5 xl:grid">
          <div className="col-span-1 max-w-xl">
            <div
              id="form"
              className="min-w-xl m-auto space-y-3 rounded-lg bg-background p-5"
            >
              <h2 className="text-2xl">Random Assigner</h2>
              <h3 className="text-base">
                Randomly assign students to all the fungible things!
              </h3>
              <AssignerDialog />
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 p-5"
                >
                  <div className="w-full space-y-4 rounded-lg">
                    <FormField
                      control={form.control}
                      name="assignerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assigner</FormLabel>
                          <AssignerSelect
                            onAssignerSelect={(value) => field.onChange(value)}
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
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {submitError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" disabled={isRunning}>
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
              <div>
                {assignedData && (
                  <div className="mt-4">
                    <PDFGenerator data={assignedData} />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-span-1 max-w-xl space-y-10">
            <Collapsible
              open={isInstructionsOpen}
              onOpenChange={setIsInstructionsOpen}
              className="w-full"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl">Case Study</h2>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    {isInstructionsOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    <span className="sr-only">Toggle Instructions</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="space-y-2">
                <p className="mt-2">
                  I use this to randomly assign Chromebooks to my students based
                  on their groups. I have 28 students, but they are split up
                  into 2 groups (A and B) of 14 students.
                </p>
                <p>
                  I only teach 14 students at a time and only have 14
                  Chromebooks, so there should be two students assigned to each
                  Chromebook. It doesn&apos;t matter whether a student is
                  assigned to the same Chromebook that they were assigned to
                  previously or not, hence Random Assigner.
                </p>
                <p>
                  So, I would select the Chromebook Assigner, select my class,
                  and then be sure to select both Group A and Group B, then hit
                  Run Assigner.
                </p>
              </CollapsibleContent>
            </Collapsible>
            <Collapsible
              open={isDescriptionOpen}
              onOpenChange={setIsDescriptionOpen}
              className="w-full"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl">Description</h2>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    {isDescriptionOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    <span className="sr-only">Toggle Instructions</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="space-y-2">
                <p className="mt-2">This tool is good for:</p>
                <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                  <li>items that are the same, like in the case study.</li>
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
