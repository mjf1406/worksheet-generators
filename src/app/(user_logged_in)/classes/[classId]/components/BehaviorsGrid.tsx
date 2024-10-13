// BehaviorsGrid.tsx

import React from "react";
import { Card } from "~/components/ui/card"; // Import the Card component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconName, IconPrefix } from "@fortawesome/fontawesome-svg-core";
import { Edit, EllipsisVertical, Loader2, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";

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
    <div className="grid grid-cols-3 gap-4 overflow-y-scroll p-2">
      {behaviors.map((behavior) => {
        const isLoading = behavior.behavior_id === loadingBehaviorId;
        const iconParts = behavior.icon ? behavior.icon.split(" ") : null;

        return (
          <Card
            key={behavior.behavior_id}
            onClick={() => {
              if (!isLoading) {
                onBehaviorSelect(behavior.behavior_id);
              }
            }}
            className={`relative col-span-1 flex h-fit w-28 transform flex-col items-center justify-center rounded-lg border p-4 shadow-sm transition-transform hover:scale-105 ${isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          >
            {/* Dropdown Menu */}
            <div className="absolute bottom-1 right-1">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button
                    variant={"ghost"}
                    size={"icon"}
                    className="h-fit w-fit p-2"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <EllipsisVertical size={16} />{" "}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Edit size={16} className="mr-2" /> Edit behavior
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Trash2 size={16} className="mr-2" /> Delete behavior
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Loading Indicator */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-foreground/50 bg-opacity-75">
                <Loader2
                  size={32}
                  className="h-8 w-8 animate-spin text-background opacity-100"
                />
              </div>
            )}

            {/* Icon */}
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

            {/* Behavior Name */}
            <div className="text-center text-sm font-semibold">
              {behavior.name}
            </div>

            {/* Point Value Badge */}
            <div className="mt-2 flex h-7 w-fit min-w-6 items-center justify-center rounded-full bg-secondary/75 p-2 text-xs font-medium text-white">
              {behavior.point_value > 0 ? "+" : ""}
              {behavior.point_value}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default BehaviorsGrid;
