// components/ClassGroupsComponent.tsx

"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Button } from "~/components/ui/button";
import { Dialog } from "~/components/ui/dialog";
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
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import AddGroupDialog from "./AddGroupDialog";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import EditGroupDialog from "./EditGroupDialog";

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

  // Helper function to update the cache
  const updateClassesCache = (updatedClass: TeacherCourse) => {
    queryClient.setQueryData<TeacherCourse[]>(["classes"], (oldData) => {
      if (!oldData) return [updatedClass];
      return oldData.map((cls) =>
        cls.class_id === updatedClass.class_id ? updatedClass : cls,
      );
    });
  };

  const handleSaveGroup = async (updatedGroup: Group) => {
    // Optimistically update the UI
    const previousGroups = [...groups];
    const updatedGroups = groups.map((g) =>
      g.group_id === updatedGroup.group_id ? updatedGroup : g,
    );

    // Update local state and cache optimistically
    setGroups(updatedGroups);
    updateClassesCache({
      ...courseData,
      groups: updatedGroups,
    });

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("groupId", updatedGroup.group_id ?? "");
        formData.append("groupName", updatedGroup.group_name ?? "");
        formData.append("classId", courseData.class_id ?? "");
        updatedGroup.students.forEach((student) => {
          formData.append("studentIds", student.student_id ?? "");
        });

        const validatedFields = UpdateGroupSchema.safeParse({
          groupId: formData.get("groupId"),
          groupName: formData.get("groupName"),
          studentIds: formData.getAll("studentIds") as string[],
          classId: formData.get("classId"),
        });

        if (!validatedFields.success) {
          throw new Error(
            validatedFields.error.errors.map((err) => err.message).join(", "),
          );
        }

        const result = await updateGroup(formData);

        if (result.success) {
          toast({
            title: "Success",
            description: "Group updated successfully.",
          });
          setEditingGroup(null);
        } else {
          throw new Error(result.message ?? "Failed to update group.");
        }
      } catch (error) {
        // Revert optimistic update on error
        setGroups(previousGroups);
        updateClassesCache({
          ...courseData,
          groups: previousGroups,
        });

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

  const handleDeleteGroup = async (group: Group) => {
    // Optimistically update the UI
    const previousGroups = [...groups];
    const updatedGroups = groups.filter((g) => g.group_id !== group.group_id);

    // Update local state and cache optimistically
    setGroups(updatedGroups);
    updateClassesCache({
      ...courseData,
      groups: updatedGroups,
    });

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("groupId", group.group_id ?? "");
        formData.append("classId", courseData.class_id ?? "");

        const validatedFields = DeleteGroupSchema.safeParse({
          groupId: formData.get("groupId"),
          classId: formData.get("classId"),
        });

        if (!validatedFields.success) {
          throw new Error(
            validatedFields.error.errors.map((err) => err.message).join(", "),
          );
        }

        const result = await deleteGroup(formData);

        if (result.success) {
          toast({
            title: "Success",
            description: "Group deleted successfully.",
          });
          setDeletingGroup(null);
        } else {
          throw new Error(result.message || "Failed to delete group.");
        }
      } catch (error) {
        // Revert optimistic update on error
        setGroups(previousGroups);
        updateClassesCache({
          ...courseData,
          groups: previousGroups,
        });

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

  const handleGroupAdded = (newGroup: Group) => {
    // Optimistically update the UI
    const updatedGroups = [...groups, newGroup];

    // Update local state and cache optimistically
    setGroups(updatedGroups);
    updateClassesCache({
      ...courseData,
      groups: updatedGroups,
    });

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
      <div className="grid grid-cols-3 gap-2 md:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7">
        {groups.map((group) => (
          <Card key={group.group_id} className="relative col-span-1">
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
            <Link
              href={{
                pathname: `/classes/${courseData.class_id}/${group.group_id}`,
              }}
              className="block p-2 md:p-4"
            >
              <CardHeader className="-px-2">
                <CardTitle className="text-center text-sm md:text-xl">
                  {group.group_name}
                </CardTitle>
                <CardDescription className="text-2xs flex w-full flex-row items-center justify-center gap-2 text-center md:text-xs">
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
              otherGroups={groups.filter(
                (g) => g.group_id !== editingGroup.group_id,
              )}
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
