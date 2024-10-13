// components/ClassGroupsComponent.tsx

"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Edit, Loader2, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { Group, TeacherCourse } from "~/server/db/types";
import { deleteGroup, updateGroup } from "../[classId]/updateGroup"; // Ensure correct import
import { useToast } from "~/components/ui/use-toast";
import type { StudentData } from "~/app/api/getClassesGroupsStudents/route";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import AddGroupDialog from "./AddGroupDialog";
import { cn } from "~/lib/utils";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";

// Define Zod schemas for validation
const UpdateGroupSchema = z.object({
  groupId: z.string().nonempty("Group ID is required."),
  groupName: z.string().min(1, "Group name is required."),
  studentIds: z.array(z.string()),
  classId: z.string().nonempty("Class ID is required."),
});

const DeleteGroupSchema = z.object({
  groupId: z.string().nonempty("Group ID is required."),
  classId: z.string().nonempty("Class ID is required."),
});

interface ClassGroupsComponentProps {
  class: TeacherCourse;
}

const EditGroupDialog = ({
  group,
  allStudents,
  onSave,
  isSaving,
}: {
  group: Group;
  allStudents: StudentData[];
  onSave: (updatedGroup: Group) => void;
  isSaving: boolean;
}) => {
  const [groupName, setGroupName] = useState(group.group_name);
  const [selectedStudents, setSelectedStudents] = useState<
    Record<string, boolean>
  >(
    Object.fromEntries(
      allStudents.map((student) => [
        student.student_id,
        group.students.some((s) => s.student_id === student.student_id),
      ]),
    ),
  );

  const selectedCount = Object.values(selectedStudents).filter(Boolean).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedStudents = allStudents.filter(
      (student) => selectedStudents[student.student_id ?? ""],
    );
    onSave({ ...group, group_name: groupName, students: updatedStudents });
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Group</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="group-name">Group Name</Label>
          <Input
            id="group-name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Select Students</Label>
          <div className="max-h-60 overflow-y-auto rounded border p-2">
            {allStudents.map((student) => (
              <div
                key={student.student_id}
                className="flex items-center space-x-2"
              >
                <Checkbox
                  id={`student-${student.student_id}`}
                  checked={selectedStudents[student.student_id ?? ""] ?? false}
                  onCheckedChange={() =>
                    handleStudentToggle(student.student_id ?? "")
                  }
                />
                <Label htmlFor={`student-${student.student_id}`}>
                  {student.student_name_en}
                </Label>
              </div>
            ))}
          </div>
          <div>Selected: {selectedCount}</div>
        </div>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </DialogContent>
  );
};

const ClassGroupsComponent: React.FC<ClassGroupsComponentProps> = ({
  class: courseData,
}) => {
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  useEffect(() => {
    setGroups(courseData.groups ?? []);
  }, [courseData]);

  // Function to handle group updates
  const handleSaveGroup = async (updatedGroup: Group) => {
    startTransition(async () => {
      try {
        // Create FormData object
        const formData = new FormData();
        formData.append("groupId", updatedGroup.group_id ?? "");
        formData.append("groupName", updatedGroup.group_name ?? "");
        formData.append("classId", courseData.class_id ?? "");
        updatedGroup.students.forEach((student) => {
          formData.append("studentIds", student.student_id ?? "");
        });

        // Validate the FormData using UpdateGroupSchema
        const validatedFields = UpdateGroupSchema.safeParse({
          groupId: formData.get("groupId"),
          groupName: formData.get("groupName"),
          studentIds: formData.getAll("studentIds") as string[],
          classId: formData.get("classId"),
        });

        if (!validatedFields.success) {
          // Handle validation errors
          throw new Error(
            validatedFields.error.errors.map((err) => err.message).join(", "),
          );
        }

        // Call updateGroup with FormData
        const result = await updateGroup(formData);

        if (result.success) {
          setGroups((prevGroups) =>
            prevGroups.map((group) =>
              group.group_id === updatedGroup.group_id ? updatedGroup : group,
            ),
          );
          toast({
            title: "Success",
            description: "Group updated successfully.",
          });
          setEditingGroup(null);
        } else {
          throw new Error(result.message ?? "Failed to update group.");
        }
      } catch (error) {
        console.error("Failed to update group:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to update group. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  // Function to handle group deletion
  const handleDeleteGroup = async (group: Group) => {
    startTransition(async () => {
      try {
        // Create FormData object as required
        const formData = new FormData();
        formData.append("groupId", group.group_id ?? "");
        formData.append("classId", courseData.class_id ?? "");

        // Validate the FormData using DeleteGroupSchema
        const validatedFields = DeleteGroupSchema.safeParse({
          groupId: formData.get("groupId"),
          classId: formData.get("classId"),
        });

        if (!validatedFields.success) {
          // Handle validation errors
          throw new Error(
            validatedFields.error.errors.map((err) => err.message).join(", "),
          );
        }

        // Call deleteGroup with FormData
        const result = await deleteGroup(formData);

        if (result.success) {
          await queryClient.invalidateQueries({
            queryKey: ["groups", courseData.class_id],
          });
          await queryClient.refetchQueries({
            queryKey: ["groups", courseData.class_id],
          });
          await queryClient.invalidateQueries({ queryKey: ["classes"] });
          setGroups((prevGroups) =>
            prevGroups.filter((g) => g.group_id !== group.group_id),
          );
          toast({
            title: "Success",
            description: "Group deleted successfully.",
          });
          setDeletingGroup(null);
        } else {
          throw new Error(result.message || "Failed to delete group.");
        }
      } catch (error) {
        console.error("Failed to delete group:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to delete group. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  // Function to handle adding a new group
  const handleGroupAdded = (newGroup: Group) => {
    setGroups((prevGroups) => [...prevGroups, newGroup]);
    toast({
      title: "Success",
      description: "Group added successfully.",
    });
  };

  return (
    <>
      <div className="text-3xl">Groups</div>
      <div className="mb-4">
        <AddGroupDialog
          classId={courseData.class_id}
          students={courseData.students}
          onGroupAdded={handleGroupAdded}
        />
      </div>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7">
        {groups.map((group) => (
          <Card key={group.group_id} className="relative col-span-1">
            {/* DropdownMenu is outside the Link to prevent event propagation issues */}
            <div className="absolute right-0 top-1 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => setEditingGroup(group)}>
                    <Edit size={16} className="mr-2" /> Edit Group
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => setDeletingGroup(group)}
                    className="text-destructive"
                  >
                    <Trash2 size={16} className="mr-2" /> Delete Group
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {/* Link only wraps the CardHeader and CardDescription */}
            <Link
              href={{
                pathname: `/classes/${courseData.class_id}/${group.group_id}`,
              }}
              className="block p-4"
            >
              <CardHeader className="-px-2">
                <CardTitle className="text-center text-xl">
                  {group.group_name}
                </CardTitle>
                <CardDescription className="flex w-full flex-row items-center justify-center gap-2 text-center text-xs">
                  <div>{group.students.length} students</div>
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>
        ))}

        {/* Edit Group Dialog */}
        <Dialog
          open={editingGroup !== null}
          onOpenChange={(open) => !open && setEditingGroup(null)}
        >
          {editingGroup && (
            <EditGroupDialog
              group={editingGroup}
              allStudents={courseData.students ?? []}
              onSave={handleSaveGroup}
              isSaving={isPending}
            />
          )}
        </Dialog>

        {/* Delete Group Confirmation Dialog */}
        <AlertDialog
          open={deletingGroup !== null}
          onOpenChange={(open) => !open && setDeletingGroup(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the group{" "}
                <strong>{deletingGroup?.group_name}</strong>? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  deletingGroup && handleDeleteGroup(deletingGroup)
                }
                disabled={isPending}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} className="mr-2" /> Delete
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};

export default ClassGroupsComponent;
