// BehaviorsGrid.tsx

import React from "react";
import { Button } from "~/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconName, IconPrefix } from "@fortawesome/fontawesome-svg-core";
import { Loader2 } from "lucide-react";

interface Behavior {
  behavior_id: string;
  name: string;
  point_value: number;
  description?: string | null;
  icon?: string | null;
}

interface BehaviorsGridProps {
  behaviors: Behavior[];
  onBehaviorSelect: (behavior_id: string) => void;
  loadingBehaviorId: string | null;
}

const BehaviorsGrid: React.FC<BehaviorsGridProps> = ({
  behaviors,
  onBehaviorSelect,
  loadingBehaviorId,
}) => {
  return (
    <div className="grid grid-cols-3 gap-4 overflow-y-scroll">
      {behaviors.map((behavior) => {
        const isLoading = behavior.behavior_id === loadingBehaviorId;
        const iconParts = behavior.icon ? behavior.icon.split(" ") : null;
        return (
          <Button
            key={behavior.behavior_id}
            variant="outline"
            disabled={isLoading}
            onClick={() => onBehaviorSelect(behavior.behavior_id)}
            className="relative col-span-1 flex h-fit w-28 flex-col items-center justify-center p-2"
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin" />
              </div>
            )}
            {iconParts ? (
              <FontAwesomeIcon
                icon={[iconParts[0] as IconPrefix, iconParts[1] as IconName]}
                className="mb-2 h-8 w-8"
              />
            ) : (
              <FontAwesomeIcon
                icon="question-circle"
                className="mb-2 h-8 w-8"
              />
            )}
            <div className="text-center text-base font-semibold">
              {behavior.name}
            </div>
            <div className="flex h-7 w-fit min-w-6 items-center justify-center rounded-full bg-secondary/75 p-2">
              {behavior.point_value > 0 ? "+" : ""}
              {behavior.point_value}
            </div>
          </Button>
        );
      })}
    </div>
  );
};

export default BehaviorsGrid;
