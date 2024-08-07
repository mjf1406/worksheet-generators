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
import { runRandomAssigner } from "../actions";
import { useAuth } from "@clerk/nextjs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

const runAssignerSchema = z.object({
  assignerId: z.string().min(1, "Assigner is required"),
  classId: z.string().min(1, "Class is required"),
  selectedGroups: z.array(z.string()),
});

type RunAssignerFormData = z.infer<typeof runAssignerSchema>;

export default function RandomAssignerPage() {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const { userId } = useAuth();
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
      await runRandomAssigner(
        userId,
        data.classId,
        data.assignerId,
        data.selectedGroups,
      );
      // Handle successful submission (e.g., show a success message)
    } catch (error) {
      console.error("Failed to run assigner:", error);
      // Handle error (e.g., show an error message)
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
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mt-5 flex w-full flex-col items-center justify-center gap-4">
        <div className="max-w-xl space-y-5">
          <Collapsible
            open={isInstructionsOpen}
            onOpenChange={setIsInstructionsOpen}
            className="w-full"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl">Instructions</h2>
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
                You can use this to assign permanent or semi-permanent things to
                your students in your classroom, such as Chromebooks.
              </p>
              <p>
                I, for example, use it to randomly assign Chromebooks to my
                students based on their groups. I have 28 students, but they are
                split up into 2 groups (A and B) of 14 students.
              </p>
              <p>
                I only teach 14 students at a time and only have 14 Chromebooks,
                so there should be two students assigned to each Chromebook. It
                doesn&apos;t matter whether a student is assigned to the same
                Chromebook that they were assigned to previously or not, hence
                Random Assigner.
              </p>
              <p>
                So, I would select the Chromebook Assigner, select my class, and
                then be sure to select both Group A and Group B, then hit Run
                Assigner.
              </p>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <div className="flex items-center justify-start gap-5">
          <h2 className="text-2xl">Assigner</h2>
          <AssignerDialog />
        </div>
        <div className="w-full max-w-xl">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 bg-background p-5"
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
              <Button type="submit">Run Assigner</Button>
            </form>
          </Form>
        </div>
      </div>
    </ContentLayout>
  );
}
