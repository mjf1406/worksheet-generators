"use client";

import React, { useState, useMemo } from "react";
import type { TeacherCourse } from "~/server/db/types";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";

interface GroupsSelectProps {
  selectedClassId: string | null;
  onGroupsSelect: (selectedGroups: string[]) => void;
  classes: TeacherCourse[];
}

export default function GroupsSelect({
  selectedClassId,
  onGroupsSelect,
  classes,
}: GroupsSelectProps) {
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  const groups = useMemo(() => {
    const selectedClass = classes.find((c) => c.class_id === selectedClassId);
    // Assuming groups are stored in a property of TeacherCourse, adjust if necessary
    return selectedClass?.groups;
  }, [classes, selectedClassId]);

  const handleGroupCheck = (groupId: string) => {
    setSelectedGroupIds((prev) => {
      const updated = prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId];
      onGroupsSelect(updated);
      return updated;
    });
  };

  const selectedCount = selectedGroupIds.length;

  return (
    <div className="flex w-full flex-col items-start gap-2">
      {!selectedClassId ? (
        <div className="flex w-full items-center gap-2">
          Select a class first...
        </div>
      ) : groups && groups.length > 0 ? (
        <div className="ml-2 grid grid-cols-2 gap-4">
          {groups.map((group) => (
            <div
              key={group.group_id}
              className="col-span-1 flex items-center gap-2"
            >
              <Checkbox
                id={`group-${group.group_id}`}
                checked={selectedGroupIds.includes(group.group_id)}
                onCheckedChange={() => handleGroupCheck(group.group_id)}
              />
              <Label htmlFor={`group-${group.group_id}`}>
                {group.group_name}
              </Label>
            </div>
          ))}
        </div>
      ) : (
        <div>No groups available for this class.</div>
      )}
      <div className="ml-2">
        Selected: {selectedCount === 0 ? "Whole class" : selectedCount}
      </div>
    </div>
  );
}
