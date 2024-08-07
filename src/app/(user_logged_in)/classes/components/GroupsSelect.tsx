"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { Group } from "~/server/db/types";
import { fetchGroups } from "./ClassGroups";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";

interface GroupsSelectProps {
  selectedClassId: string | null;
  onGroupsSelect: (selectedGroups: string[]) => void;
}

export default function GroupsSelect({
  selectedClassId,
  onGroupsSelect,
}: GroupsSelectProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  useEffect(() => {
    const loadGroups = async () => {
      if (!selectedClassId) {
        setGroups([]);
        setSelectedGroupIds([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const fetchedGroups = await fetchGroups(selectedClassId);
        setGroups(fetchedGroups);
        setSelectedGroupIds([]);
      } catch (err) {
        setError("Failed to load groups");
      } finally {
        setIsLoading(false);
      }
    };

    void loadGroups();
  }, [selectedClassId]);

  const handleGroupCheck = (groupId: string) => {
    setSelectedGroupIds((prev) => {
      const updated = prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId];
      onGroupsSelect(updated);
      return updated;
    });
  };

  const selectedCount = useMemo(
    () => selectedGroupIds.length,
    [selectedGroupIds],
  );

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex w-full flex-col items-start gap-2">
      {!selectedClassId ? (
        <div className="flex w-full items-center gap-2">
          Select a class first...
        </div>
      ) : (
        <div className="ml-2 grid grid-cols-2 gap-4">
          {isLoading ? (
            <div>Loading groups...</div>
          ) : (
            groups.map((group) => (
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
            ))
          )}
        </div>
      )}
      <div className="ml-2">
        Selected: {selectedCount === 0 ? "Whole class" : selectedCount}
      </div>
    </div>
  );
}
