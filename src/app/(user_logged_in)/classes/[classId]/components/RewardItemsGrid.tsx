// RewardItemsGrid.tsx

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
import { deleteRewardItem } from "../rewardItemActions";
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
import type { RewardItem } from "~/server/db/types";
import EditRewardItemDialog from "./EditRewardItemDialog";

interface RewardItemsGridProps {
  rewardItems: RewardItem[];
  onRewardItemSelect: (item_id: string) => void;
  loadingItemId: string | null;
  refreshRewardItems: () => void; // Function to refresh reward items after update/delete
}

const RewardItemsGrid: React.FC<RewardItemsGridProps> = ({
  rewardItems,
  onRewardItemSelect,
  loadingItemId,
  refreshRewardItems,
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRewardItem, setSelectedRewardItem] =
    useState<RewardItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [rewardItemToDelete, setRewardItemToDelete] =
    useState<RewardItem | null>(null);
  const { toast } = useToast();

  // Handler for clicking the Edit button
  const handleEditClick = (rewardItem: RewardItem) => {
    setSelectedRewardItem(rewardItem);
    setIsEditDialogOpen(true);
  };

  // Handler for clicking the Delete button
  const handleDeleteClick = (rewardItem: RewardItem) => {
    setRewardItemToDelete(rewardItem);
    setIsDeleteDialogOpen(true);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (!rewardItemToDelete) return;

    try {
      // Create a FormData object to send to the server action
      const formData = new FormData();
      formData.append("item_id", rewardItemToDelete.item_id);

      // Invoke the server action
      const result = await deleteRewardItem(formData);

      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        refreshRewardItems();
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
        description: "Failed to delete reward item. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Reset the deletion state
      setIsDeleteDialogOpen(false);
      setRewardItemToDelete(null);
    }
  };

  // Cancel deletion
  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setRewardItemToDelete(null);
  };

  return (
    <>
      <div className="m-auto grid max-h-64 w-full grid-cols-3 gap-4 overflow-y-auto p-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {rewardItems.map((rewardItem) => {
          const isLoading = rewardItem.item_id === loadingItemId;
          const iconParts = rewardItem.icon ? rewardItem.icon.split(" ") : null;

          return (
            <Card
              key={rewardItem.item_id}
              onClick={() => {
                if (!isLoading) {
                  onRewardItemSelect(rewardItem.item_id);
                }
              }}
              className={`relative col-span-1 flex h-full w-28 transform flex-col items-center justify-center rounded-lg border p-4 shadow-sm transition-transform hover:scale-105 ${
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
                        handleEditClick(rewardItem);
                      }}
                    >
                      <Edit size={16} className="mr-2" /> Edit reward item
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(rewardItem);
                      }}
                    >
                      <Trash2 size={16} className="mr-2" /> Delete reward item
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
                <FontAwesomeIcon icon="gift" className="mb-2 h-8 w-8" />
              )}

              {/* Reward Item Name */}
              <div className="text-2xs text-center font-semibold">
                {rewardItem.name}
              </div>

              {/* Price Badge */}
              <div className="mt-2 flex h-7 w-fit min-w-6 items-center justify-center rounded-full bg-secondary/75 p-2 text-xs font-medium">
                {rewardItem.price}
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
              <strong>{rewardItemToDelete?.name}</strong>? This action cannot be
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

      {/* Edit Reward Item Dialog */}
      {selectedRewardItem && (
        <EditRewardItemDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          rewardItem={selectedRewardItem}
          onUpdate={() => {
            setIsEditDialogOpen(false);
            refreshRewardItems();
            toast({
              title: "Success!",
              description: "Reward item updated successfully.",
            });
          }}
        />
      )}
    </>
  );
};

export default RewardItemsGrid;
