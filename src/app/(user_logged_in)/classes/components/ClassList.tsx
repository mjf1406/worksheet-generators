"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Loader2,
  SquarePen,
  School,
  Trash2,
  LayoutDashboard,
  MoreVertical,
  NotebookPen,
  CircleCheckBig,
} from "lucide-react";
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

// Import Card and DropdownMenu components from shadcn
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardContent,
} from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import JoinClassDialog from "./JoinClassDialog";
import ClassCodeDisplay from "./ClassCode";

export default function ClassList() {
  const [courseToDelete, setCourseToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
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

  async function handleDeleteClass() {
    if (!courseToDelete) return;

    if (courseToDelete.name !== deleteCourseText) {
      toast({
        title: "Class names do not match!",
        description:
          "This is case-sensitive. Please double check what you typed and try again.",
        variant: "destructive",
      });
      return;
    }
    deleteMutation.mutate(courseToDelete.id);
    // Reset the dialog state after deletion
    setCourseToDelete(null);
    setDeleteCourseText("");
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[hsl(var(--primary))]" />
        <span className="mt-4 text-lg text-[hsl(var(--foreground))]">
          Loading classes...
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex gap-5">
        <NewClassDialog />
        <JoinClassDialog />
        <Button variant="secondary" disabled onClick={addDemos}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              Adding classes...
            </>
          ) : (
            <>Coming soon...</>
          )}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.length === 0 ? (
          <div className="col-span-full flex flex-col items-center">
            <div className="rounded-lg bg-[hsl(var(--card))] p-6 text-[hsl(var(--card-foreground))] shadow-md">
              <div className="text-center">
                Add a class by clicking the button above.
              </div>
            </div>
          </div>
        ) : (
          courses.map((course) => (
            <Card
              key={course.class_id}
              className="flex h-full flex-col rounded-lg bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-lg"
            >
              <CardHeader className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="absolute right-4 top-4 h-8 w-8 p-0"
                    >
                      <MoreVertical className="h-5 w-5" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/classes/${course.class_id}/edit`}>
                        <SquarePen className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive"
                      onSelect={() =>
                        setCourseToDelete({
                          id: course.class_id,
                          name: course.class_name,
                        })
                      }
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex items-center p-6">
                  <div className="flex-shrink-0">
                    <School className="h-12 w-12 text-[hsl(var(--accent))]" />
                  </div>
                  <div className="ml-4">
                    <CardTitle className="text-2xl font-bold">
                      {`${course.class_name} (${course.class_year})`}
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm">
                      Grade {course.class_grade} - {course.role} teacher
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 px-6 py-4">
                <ClassCodeDisplay
                  classCode={course.class_code}
                  role={course.role}
                />
              </CardContent>
              <CardFooter className="flex items-center justify-start gap-2">
                <Button asChild variant="outline">
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
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger>
                      <Button asChild variant="ghost" size={"icon"}>
                        <Link href={`/classes/${course.class_id}/dashboard`}>
                          <LayoutDashboard size={20} />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Dashboard</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger>
                      <Button asChild variant="ghost" size={"icon"}>
                        <Link href={`/classes/${course.class_id}/tasks`}>
                          <NotebookPen size={20} />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Tasks</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger>
                      <Button asChild variant="ghost" size={"icon"}>
                        <Link href={`/classes/${course.class_id}/expectations`}>
                          <CircleCheckBig size={20} />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Expectations</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {courseToDelete && (
        <Dialog
          open={!!courseToDelete}
          onOpenChange={(open) => !open && setCourseToDelete(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete class</DialogTitle>
              <DialogDescription>
                Please type the class name,{" "}
                <span className="font-bold">{courseToDelete.name}</span>, below
                to confirm deletion. Deleting a class is <b>IRREVERSIBLE</b>.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="class-to-delete" className="sr-only">
                  Class to delete
                </Label>
                <Input
                  id="class-to-delete"
                  placeholder="Type class name"
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
                onClick={handleDeleteClass}
                variant="destructive"
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
      )}
    </>
  );
}
