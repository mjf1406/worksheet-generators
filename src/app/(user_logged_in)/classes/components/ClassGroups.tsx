import React, { useState } from "react";
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
import { deleteGroup, updateGroup } from "../[classId]/updateGroup";
import { useToast } from "~/components/ui/use-toast";
import type { StudentData } from "~/app/api/getClassesGroupsStudents/route";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
          />
        </div>
        <div className="space-y-2">
          <Label>Select Students</Label>
          <div className="grid grid-cols-2 gap-2">
            {allStudents.map((student) => (
              <div
                key={student.student_id}
                className="col-span-1 flex items-center space-x-2"
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
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: groups = [] } = useQuery({
    queryKey: ["groups", courseData.class_id],
    queryFn: () => courseData.groups ?? [],
    initialData: courseData.groups ?? [],
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedGroup: Group) => {
      const formData = new FormData();
      formData.append("groupId", updatedGroup.group_id ?? "");
      formData.append("groupName", updatedGroup.group_name ?? "");
      formData.append("classId", courseData.class_id ?? "");
      updatedGroup.students.forEach((student) => {
        formData.append("studentIds", student.student_id ?? "");
      });
      return updateGroup(formData);
    },
    onSuccess: (result, updatedGroup) => {
      if ("error" in result) {
        throw new Error(result.error);
      }
      toast({
        title: "Success",
        description: "Group updated successfully",
      });
      queryClient.setQueryData(
        ["groups", courseData.class_id],
        (oldData: Group[] | undefined) =>
          oldData
            ? oldData.map((group) =>
                group.group_id === updatedGroup.group_id ? updatedGroup : group,
              )
            : [],
      );
      void queryClient.invalidateQueries({ queryKey: ["classes"] });
      setEditingGroup(null);
    },
    onError: (error) => {
      console.error("Failed to update group:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update group. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (group: Group) => {
      const formData = new FormData();
      formData.append("groupId", group.group_id ?? "");
      formData.append("classId", courseData.class_id ?? "");
      return deleteGroup(formData);
    },
    onSuccess: (result, deletedGroup) => {
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        queryClient.setQueryData(
          ["groups", courseData.class_id],
          (oldData: Group[] | undefined) =>
            oldData
              ? oldData.filter((g) => g.group_id !== deletedGroup.group_id)
              : [],
        );
        void queryClient.invalidateQueries({ queryKey: ["classes"] });
      } else {
        throw new Error(result.error);
      }
    },
    onError: (error) => {
      console.error("Failed to delete group:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete group. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setDeletingGroup(null);
    },
  });

  const handleDeleteGroup = (group: Group) => {
    deleteMutation.mutate(group);
  };

  const handleSaveGroup = (updatedGroup: Group) => {
    updateMutation.mutate(updatedGroup);
  };

  return (
    <div className="flex flex-wrap gap-5">
      {groups.map((group) => (
        <div
          key={group?.group_id ?? "unknown"}
          className="rounded-lg bg-secondary/30 p-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl">{group?.group_name ?? "Unnamed Group"}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setEditingGroup(group)}>
                  <Edit size={16} className="mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setDeletingGroup(group)}
                  className="text-destructive"
                >
                  <Trash2 size={16} className="mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <ul className="text-xs">
            <div className="mb-1 text-base">
              Members: {group?.students?.length ?? 0}
            </div>
            {group?.students?.map((student) => (
              <li key={student.student_id ?? "unknown"}>
                {student.student_name_en ?? "Unnamed Student"}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <Dialog
        open={editingGroup !== null}
        onOpenChange={(open) => !open && setEditingGroup(null)}
      >
        {editingGroup && (
          <EditGroupDialog
            group={editingGroup}
            allStudents={courseData.students!}
            onSave={handleSaveGroup}
            isSaving={updateMutation.isPending}
          />
        )}
      </Dialog>
      <AlertDialog
        open={deletingGroup !== null}
        onOpenChange={(open) => !open && setDeletingGroup(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              group &apos;{deletingGroup?.group_name}&apos; and remove it from
              our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingGroup && handleDeleteGroup(deletingGroup)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClassGroupsComponent;
