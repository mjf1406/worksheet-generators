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
import { updateBehavior } from "../behaviorActions";
import { toast } from "~/components/ui/use-toast";
import type { IconName, IconPrefix } from "@fortawesome/fontawesome-svg-core";
import FAIconPicker from "~/components/pickers/FontAwesomeIconPicker";
import ColorPicker from "~/components/pickers/ShadcnColorPicker";

interface Behavior {
  behavior_id: string;
  name: string;
  point_value: number;
  description?: string | null;
  icon?: string | null;
  color?: string;
  class_id?: string;
  user_id: string;
  created_date: string;
  updated_date: string;
}

interface EditBehaviorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  behavior: Behavior;
  onUpdate: () => void;
}

const EditBehaviorDialog: React.FC<EditBehaviorDialogProps> = ({
  isOpen,
  onClose,
  behavior,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    behavior_id: behavior.behavior_id,
    name: behavior.name,
    point_value: behavior.point_value.toString(),
    description: behavior.description ?? "",
    icon: behavior.icon ?? "",
    color: behavior.color ?? "#000000",
    class_id: behavior.class_id ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<
    { name: IconName; prefix: IconPrefix } | undefined
  >(
    behavior.icon
      ? {
          name: behavior.icon.split(" ")[1] as IconName,
          prefix: behavior.icon.split(" ")[0] as IconPrefix,
        }
      : undefined,
  );

  useEffect(() => {
    setFormData({
      behavior_id: behavior.behavior_id,
      name: behavior.name,
      point_value: behavior.point_value.toString(),
      description: behavior.description ?? "",
      icon: behavior.icon ?? "",
      color: behavior.color ?? "#000000",
      class_id: behavior.class_id ?? "",
    });
    setSelectedIcon(
      behavior.icon
        ? {
            name: behavior.icon.split(" ")[1] as IconName,
            prefix: behavior.icon.split(" ")[0] as IconPrefix,
          }
        : undefined,
    );
  }, [behavior]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "point_value" ? value : value,
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

      const result = await updateBehavior(data);

      if (result.success) {
        onUpdate();
        toast({
          title: "Success!",
          description: "Behavior updated successfully.",
        });
        onClose();
      } else {
        console.error(result.message);
        toast({
          title: "Error!",
          description: result.message || "Failed to update the behavior.",
        });
      }
    } catch (error) {
      console.error("Update Error:", error);
      toast({
        title: "Error!",
        description: "Failed to save the behavior. Please try again.",
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

  const handleSelectColor = (color: string) => {
    setFormData((prev) => ({ ...prev, color }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Behavior</DialogTitle>
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
            placeholder="Behavior Name"
            required
          />
          <Input
            name="point_value"
            type="number"
            value={formData.point_value}
            onChange={handleChange}
            placeholder="Point Value"
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
          <ColorPicker
            onSelectColor={handleSelectColor}
            selectedColor={formData.color}
          />
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

export default EditBehaviorDialog;
