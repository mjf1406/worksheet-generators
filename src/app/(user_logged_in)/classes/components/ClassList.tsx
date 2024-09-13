"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Loader2, SquarePen, School, Trash2 } from "lucide-react";
import Link from "next/link";
import removeClassFromTeacher from "~/server/actions/removeClassFromTeacher";
import { useToast } from "~/components/ui/use-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import addDemoClasses from "~/server/actions/addDemoClasses";
import NewClassDialog from "./NewClassDialog";
import { classesOptions } from "~/app/api/queryOptions";

export default function ClassList() {
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [deleteCourseText, setDeleteCourseText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);

  const { data: courses = [] } = useSuspenseQuery(classesOptions);

  async function addDemos() {
    setLoading(true);
    await addDemoClasses();
    window.location.reload();
    setLoading(false);
  }

  const deleteMutation = useMutation({
    mutationFn: (classId: string) => removeClassFromTeacher(classId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      toast({
        title: "Class deleted successfully!",
        description: `The class has been successfully deleted.`,
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete class!",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    },
  });

  async function handleDeleteClass(classId: string, className: string) {
    if (className !== deleteCourseText) {
      toast({
        title: "Class names do not match!",
        description:
          "This is case-sensitive. Please double check what you typed and try again.",
        variant: "destructive",
      });
      return;
    }
    deleteMutation.mutate(classId);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <div className="rounded-xl bg-foreground/5 p-5">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading classes...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-5">
        <NewClassDialog />
        <Button variant={"secondary"} disabled={true} onClick={addDemos}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              Adding classes...
            </>
          ) : (
            // <>Add demo classes</> // don't forget to change disabled to isLoading
            <>Coming soon...</>
          )}
        </Button>
      </div>
      <div className="m-auto flex w-full max-w-3xl flex-col gap-4">
        {courses.length === 0 ? (
          <div className="flex flex-col gap-5">
            <div className="rounded-xl bg-foreground/5 p-5">
              <div className="flex items-center justify-center gap-2">
                <div>Add a class by clicking the button above.</div>
              </div>
            </div>
          </div>
        ) : (
          courses.map((course) => (
            <div
              key={course.class_id}
              className="m-auto flex w-full gap-10 rounded-2xl bg-card-foreground/10 p-3"
            >
              <div className="flex flex-1 flex-col justify-center self-start">
                <div className="text-base font-bold lg:text-xl">
                  {`${course.class_name} (${course.class_year})`}
                </div>
                <div className="text-sm italic lg:text-sm">
                  {course.role} teacher
                </div>
                <div className="text-sm italic">grade {course.class_grade}</div>
              </div>
              <div className="m-auto flex h-full flex-1 items-end justify-end gap-2 self-end">
                <Button asChild variant={"outline"}>
                  <Link
                    href={{
                      pathname: `/classes/${course.class_id}`,
                      query: {
                        class_name: course?.class_name,
                        class_id: course?.class_id,
                      },
                    }}
                  >
                    <School className="mr-2 h-4 w-4" />
                    Open
                  </Link>
                </Button>
                <Button
                  asChild
                  variant={"ghost"}
                  className="bg-inherit px-2 py-1"
                >
                  <Link href={`/classes/${course.class_id}/edit`}>
                    <SquarePen className="h-5 w-5" />
                  </Link>
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant={"destructive"}
                      className="px-2 py-1"
                      onClick={() => setCourseToDelete(course.class_name)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Delete class</DialogTitle>
                      <DialogDescription>
                        Please type the class name,{" "}
                        <span id="class-id" className="font-bold">
                          {courseToDelete}
                        </span>
                        , below in order to confirm deletion. Deleting a class
                        is <b>IRREVERSIBLE</b>.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2">
                      <div className="grid flex-1 gap-2">
                        <Label htmlFor="link" className="sr-only">
                          Class to delete
                        </Label>
                        <Input
                          id="class-to-delete"
                          value={deleteCourseText}
                          onChange={(e) => setDeleteCourseText(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter className="sm:justify-start">
                      <DialogClose asChild>
                        <Button type="button" variant="outline">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        onClick={() =>
                          handleDeleteClass(course.class_id, course.class_name)
                        }
                        variant={"destructive"}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete class"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
