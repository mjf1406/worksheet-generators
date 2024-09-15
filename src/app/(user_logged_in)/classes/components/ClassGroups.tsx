"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { SquarePen, Loader2 } from "lucide-react";
import type { Group, TeacherCourse } from "~/server/db/types";
import { updateGroup } from "../[classId]/updateGroup";
import { useToast } from "~/components/ui/use-toast";
import type { StudentData } from "~/app/api/getClassesGroupsStudents/route";

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
  const [groups, setGroups] = useState<Group[]>(courseData.groups ?? []);
  const [isSaving, setIsSaving] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const { toast } = useToast();

  const handleSaveGroup = async (updatedGroup: Group) => {
    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append("groupId", updatedGroup.group_id ?? "");
      formData.append("groupName", updatedGroup.group_name ?? "");
      formData.append("classId", courseData.class_id ?? "");
      updatedGroup.students.forEach((student) => {
        formData.append("studentIds", student.student_id ?? "");
      });

      console.log("🚀 ~ handleSaveGroup ~ formData:", formData);
      const result = await updateGroup(formData);

      if ("error" in result) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: "Group updated successfully",
      });

      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group.group_id === updatedGroup.group_id ? updatedGroup : group,
        ),
      );
      setEditingGroup(null);
    } catch (error) {
      console.error("Failed to update group:", error as Error);
      toast({
        title: "Error",
        description: "Failed to update group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-5">
      {groups.map((group) => (
        <div key={group.group_id} className="rounded-lg bg-secondary/30 p-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xl">{group.group_name}</h3>
            <Dialog
              open={editingGroup?.group_id === group.group_id}
              onOpenChange={(open) => !open && setEditingGroup(null)}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="bg-inherit px-2 py-1"
                  onClick={() => setEditingGroup(group)}
                >
                  <SquarePen className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              {editingGroup?.group_id === group.group_id && (
                <EditGroupDialog
                  group={group}
                  allStudents={courseData.students!}
                  onSave={handleSaveGroup}
                  isSaving={isSaving}
                />
              )}
            </Dialog>
          </div>
          <ul className="text-xs">
            <div className="mb-1 text-base">
              Members: {group.students.length}
            </div>
            {group.students.map((student) => (
              <li key={student.student_id ?? ""}>{student.student_name_en}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ClassGroupsComponent;
