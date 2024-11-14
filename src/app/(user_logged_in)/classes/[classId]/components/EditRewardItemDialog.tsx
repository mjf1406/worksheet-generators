// EditRewardItemDialog.tsx

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { updateRewardItem } from "../rewardItemActions";
import { toast } from "~/components/ui/use-toast";
import type { IconName, IconPrefix } from "@fortawesome/fontawesome-svg-core";
import FAIconPicker from "~/components/pickers/FontAwesomeIconPicker";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "~/components/ui/select";
import type { RewardItem } from "~/server/db/types";

interface EditRewardItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  rewardItem: RewardItem;
  onUpdate: () => void;
}

const EditRewardItemDialog: React.FC<EditRewardItemDialogProps> = ({
  isOpen,
  onClose,
  rewardItem,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    item_id: rewardItem.item_id,
    name: rewardItem.name,
    price: rewardItem.price.toString(),
    description: rewardItem.description ?? "",
    icon: rewardItem.icon ?? "",
    type: rewardItem.type,
    class_id: rewardItem.class_id ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<
    { name: IconName; prefix: IconPrefix } | undefined
  >(
    rewardItem.icon
      ? {
          name: rewardItem.icon.split(" ")[1] as IconName,
          prefix: rewardItem.icon.split(" ")[0] as IconPrefix,
        }
      : undefined,
  );

  useEffect(() => {
    setFormData({
      item_id: rewardItem.item_id,
      name: rewardItem.name,
      price: rewardItem.price.toString(),
      description: rewardItem.description ?? "",
      icon: rewardItem.icon ?? "",
      type: rewardItem.type,
      class_id: rewardItem.class_id ?? "",
    });
    setSelectedIcon(
      rewardItem.icon
        ? {
            name: rewardItem.icon.split(" ")[1] as IconName,
            prefix: rewardItem.icon.split(" ")[0] as IconPrefix,
          }
        : undefined,
    );
  }, [rewardItem]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      const result = await updateRewardItem(data);

      if (result.success) {
        onUpdate();
        toast({
          title: "Success!",
          description: "Reward item updated successfully.",
        });
        onClose();
      } else {
        console.error(result.message);
        toast({
          title: "Error!",
          description: result.message || "Failed to update the reward item.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Update Error:", error);
      toast({
        title: "Error!",
        description: "Failed to save the reward item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e);
    }
  };

  const handleSelectIcon = (iconName: IconName, prefix: IconPrefix) => {
    setSelectedIcon({ name: iconName, prefix });
    setFormData((prev) => ({ ...prev, icon: `${prefix} ${iconName}` }));
  };

  const handleSelectType = (type: "solo" | "group" | "class") => {
    setFormData((prev) => ({ ...prev, type }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Reward Item</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
          className="space-y-4"
        >
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Reward Item Name"
            required
          />
          <Input
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            placeholder="price"
            required
          />
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
          />
          <FAIconPicker
            onSelectIcon={handleSelectIcon}
            selectedIcon={selectedIcon}
          />
          <div>
            <Select
              onValueChange={(value) =>
                handleSelectType(value as "solo" | "group" | "class")
              }
              value={formData.type}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solo">Solo</SelectItem>
                <SelectItem value="group">Group</SelectItem>
                <SelectItem value="class">Class</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRewardItemDialog;
