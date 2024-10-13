// BehaviorsGrid.tsx

"use client";

import React, { useState } from "react";
import { Card } from "~/components/ui/card";
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
import { useToast } from "~/components/ui/use-toast";
import { deleteBehavior } from "../behaviorActions";
import EditBehaviorDialog from "./EditBehaviorDialog";
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
import type { Behavior } from "~/server/db/types";

interface BehaviorsGridProps {
  behaviors: Behavior[];
  onBehaviorSelect: (behavior_id: string) => void;
  loadingBehaviorId: string | null;
  refreshBehaviors: () => void; // Function to refresh behaviors after update/delete
}

const BehaviorsGrid: React.FC<BehaviorsGridProps> = ({
  behaviors,
  onBehaviorSelect,
  loadingBehaviorId,
  refreshBehaviors,
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBehavior, setSelectedBehavior] = useState<Behavior | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [behaviorToDelete, setBehaviorToDelete] = useState<Behavior | null>(
    null,
  );
  const { toast } = useToast();

  // Handler for clicking the Edit button
  const handleEditClick = (behavior: Behavior) => {
    setSelectedBehavior(behavior);
    setIsEditDialogOpen(true);
  };

  // Handler for clicking the Delete button
  const handleDeleteClick = (behavior: Behavior) => {
    setBehaviorToDelete(behavior);
    setIsDeleteDialogOpen(true);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (!behaviorToDelete) return;

    try {
      // Create a FormData object to send to the server action
      const formData = new FormData();
      formData.append("behavior_id", behaviorToDelete.behavior_id);

      // Invoke the server action
      const result = await deleteBehavior(formData);

      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        refreshBehaviors();
      } else {
        toast({
          title: "Error!",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Delete Error:", error);
      toast({
        title: "Error!",
        description: "Failed to delete behavior. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Reset the deletion state
      setIsDeleteDialogOpen(false);
      setBehaviorToDelete(null);
    }
  };

  // Cancel deletion
  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setBehaviorToDelete(null);
  };

  return (
    <>
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
              style={{
                borderColor: behavior.color ?? "",
                borderWidth: "0.5rem",
              }}
              className={`relative col-span-1 flex h-fit w-28 transform flex-col items-center justify-center rounded-lg border p-4 shadow-sm transition-transform hover:scale-105 ${
                isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              }`}
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
                        handleEditClick(behavior);
                      }}
                    >
                      <Edit size={16} className="mr-2" /> Edit behavior
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(behavior);
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
                  style={{ color: behavior.color ?? "" }}
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
              <div className="mt-2 flex h-7 w-fit min-w-6 items-center justify-center rounded-full bg-secondary/75 p-2 text-xs font-medium">
                {behavior.point_value > 0 ? "+" : ""}
                {behavior.point_value}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Alert Dialog for Deletion Confirmation */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{behaviorToDelete?.name}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              <Trash2 size={16} className="mr-2" /> Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Behavior Dialog */}
      {selectedBehavior && (
        <EditBehaviorDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          behavior={selectedBehavior}
          onUpdate={() => {
            setIsEditDialogOpen(false);
            refreshBehaviors();
            toast({
              title: "Success!",
              description: "Behavior updated successfully.",
            });
          }}
        />
      )}
    </>
  );
};

export default BehaviorsGrid;
