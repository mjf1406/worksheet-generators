// CreateRewardItemDialog.tsx

"use client";

import React from "react";
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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "~/components/ui/select";
import FAIconPicker from "~/components/pickers/FontAwesomeIconPicker";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { IconName, IconPrefix } from "@fortawesome/fontawesome-svg-core";

interface CreateRewardItemDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateRewardItem: (rewardItemData: RewardItemData) => Promise<void>;
  classId: string;
}

const createRewardItemSchema = z.object({
  name: z.string().nonempty("Name is required"),
  price: z.preprocess(
    (val) => parseFloat(val as string),
    z.number().nonnegative("Price must be a non-negative number"),
  ),
  description: z.string().optional(),
  icon: z
    .object({
      name: z.custom<IconName>(),
      prefix: z.custom<IconPrefix>(),
    })
    .optional(),
  type: z.enum(["solo", "group", "class"]),
});

export type RewardItemFormData = z.infer<typeof createRewardItemSchema>;

export type RewardItemData = {
  name: string;
  price: number;
  description?: string | null;
  icon?: string | null;
  type: "solo" | "group" | "class";
  class_id: string | null;
};

const CreateRewardItemDialog: React.FC<CreateRewardItemDialogProps> = ({
  open,
  onClose,
  onCreateRewardItem,
  classId,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<RewardItemFormData>({
    resolver: zodResolver(createRewardItemSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      icon: undefined,
      type: "solo",
    },
  });

  const onSubmit = async (data: RewardItemFormData) => {
    const newRewardItem: RewardItemData = {
      name: data.name,
      price: data.price,
      description: data.description ?? null,
      icon: data.icon ? `${data.icon.prefix} ${data.icon.name}` : null,
      type: data.type,
      class_id: classId,
    };
    try {
      await onCreateRewardItem(newRewardItem);
      onClose();
      reset();
    } catch (error) {
      console.error("Error creating reward item:", error);
      // Handle error (e.g., show a toast or error message)
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Reward Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input placeholder="Name" {...register("name")} />
            {errors.name && (
              <p className="text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Input
              placeholder="Price"
              type="number"
              {...register("price")}
              min={1}
              defaultValue={1}
            />
            {errors.price && (
              <p className="text-red-500">{errors.price.message}</p>
            )}
          </div>
          <div>
            <Textarea placeholder="Description" {...register("description")} />
            {errors.description && (
              <p className="text-red-500">{errors.description.message}</p>
            )}
          </div>
          <div>
            <FAIconPicker
              selectedIcon={watch("icon")}
              onSelectIcon={(name, prefix) =>
                setValue("icon", { name, prefix })
              }
            />
            {errors.icon && (
              <p className="text-red-500">{errors.icon.message}</p>
            )}
          </div>
          <div>
            <Select
              onValueChange={(value) =>
                setValue("type", value as "solo" | "group" | "class")
              }
              defaultValue={watch("type")}
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
            {errors.type && (
              <p className="text-red-500">{errors.type.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRewardItemDialog;
