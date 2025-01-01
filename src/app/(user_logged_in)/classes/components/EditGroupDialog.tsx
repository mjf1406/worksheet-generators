// EditGroupDialog.tsx

"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Loader2, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { Group } from "~/server/db/types";
import type { StudentData } from "~/app/api/getClassesGroupsStudents/route";

interface EditGroupDialogProps {
  group: Group;
  allStudents: StudentData[];
  onSave: (updatedGroup: Group) => void;
  isSaving: boolean;
  otherGroups: Group[];
}

const EditGroupDialog: React.FC<EditGroupDialogProps> = ({
  group,
  allStudents,
  onSave,
  isSaving,
  otherGroups,
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

  const [presetSelection, setPresetSelection] = useState<string>("none");

  const selectedCount = Object.values(selectedStudents).filter(Boolean).length;

  // Function to deselect all students (Clear Selection)
  const handleDeselectAll = () => {
    setSelectedStudents(
      Object.fromEntries(
        allStudents.map((student) => [student.student_id, false]),
      ),
    );
    setPresetSelection("clear");
  };

  // Function to handle dropdown selection
  const handleDropdownSelect = (option: string) => {
    if (option === "clear") {
      handleDeselectAll();
    } else {
      // Find the selected group
      const selectedGroup = otherGroups.find((g) => g.group_id === option);
      if (selectedGroup) {
        // Select the opposite of the selected group
        const selectedGroupStudentIds = new Set(
          selectedGroup.students.map((s) => s.student_id),
        );
        const newSelected = Object.fromEntries(
          allStudents.map((student) => [
            student.student_id,
            !selectedGroupStudentIds.has(student.student_id),
          ]),
        );
        setSelectedStudents(newSelected);
        setPresetSelection(option);
      }
    }
  };

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
        {/* Group Name Input */}
        <div className="space-y-2">
          <Label htmlFor="group-name">Group Name</Label>
          <Input
            id="group-name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
        </div>

        {/* Dropdown for Selecting Opposite of Other Groups or Clear */}
        <div className="space-y-2">
          <Label>Select Preset Selection</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full text-left">
                {presetSelection === "clear"
                  ? "Clear Selection"
                  : presetSelection !== "none"
                    ? `Opposite of ${otherGroups.find((g) => g.group_id === presetSelection)?.group_name}`
                    : "Select Option"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {otherGroups.map((og) => (
                <DropdownMenuItem
                  key={og.group_id}
                  onSelect={() => handleDropdownSelect(og.group_id)}
                >
                  {presetSelection === og.group_id && (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Select Opposite of {og.group_name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onSelect={() => handleDropdownSelect("clear")}>
                {presetSelection === "clear" && (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Clear Selection
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Deselect All Button and Student Selection */}
        <div className="space-y-2">
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleDeselectAll}
              disabled={selectedCount === 0 || isSaving}
              className="ml-4 h-10"
            >
              Deselect All
            </Button>
            <Label>Select Students</Label>

            <div className="grid grid-cols-2 gap-2">
              {allStudents.map((student) => (
                <div
                  key={student.student_id}
                  className="col-span-1 flex items-center gap-2"
                >
                  <Checkbox
                    id={`student-${student.student_id}`}
                    checked={
                      selectedStudents[student.student_id ?? ""] ?? false
                    }
                    onCheckedChange={() =>
                      handleStudentToggle(student.student_id ?? "")
                    }
                  />
                  <Label htmlFor={`student-${student.student_id}`}>
                    {student.student_name_first_en}{" "}
                    {student.student_name_last_en}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 text-sm">
            Selected: {selectedCount}{" "}
            {selectedCount === 1 ? "student" : "students"}
          </div>
        </div>

        {/* Submit Button */}
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

export default EditGroupDialog;
