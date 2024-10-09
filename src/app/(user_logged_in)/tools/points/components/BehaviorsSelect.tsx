// app/(user_logged_in)/points/components/BehaviorsSelect.tsx

"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { Behavior } from "~/server/db/types";

interface BehaviorsSelectProps {
  onBehaviorSelect: (value: string) => void;
  behaviors: Behavior[];
}

const BehaviorsSelect: React.FC<BehaviorsSelectProps> = ({
  onBehaviorSelect,
  behaviors,
}) => {
  return (
    <Select onValueChange={onBehaviorSelect}>
      <SelectTrigger>
        <SelectValue placeholder="Select behavior" />
      </SelectTrigger>
      <SelectContent>
        {behaviors.map((behavior) => (
          <SelectItem key={behavior.behavior_id} value={behavior.behavior_id}>
            {behavior.name} ({behavior.point_value > 0 ? "+" : ""}
            {behavior.point_value} points)
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default BehaviorsSelect;
