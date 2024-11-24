// EditRewardItemDialog.tsx

"use client";

import React, { useEffect } from "react";
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
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { IconName, IconPrefix } from "@fortawesome/fontawesome-svg-core";
import { toast } from "~/components/ui/use-toast";
import { updateRewardItem } from "../rewardItemActions";
import type { RewardItem, RewardItemUpdate } from "~/server/db/types";
import { Label } from "~/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { CircleHelp } from "lucide-react";
import { RewardItemData } from "~/app/(user_logged_in)/tools/points/components/CreateRewardItemDialog";

// Define the Achievement interface
interface Achievement {
  id?: string; // Optional for existing achievements
  threshold: number;
  name: string;
}

// Define the form data type
export type RewardItemFormData = {
  item_id: string;
  name: string;
  title?: string | null;
  price: number;
  description?: string | null;
  icon?: {
    name: IconName;
    prefix: IconPrefix;
  };
  type: "solo" | "group" | "class";
  class_id: string;
  achievements?: Achievement[];
};

interface EditRewardItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  rewardItem: RewardItem;
  onUpdate: () => void;
}

// Define the Zod schema for validation
const editRewardItemFormSchema = z.object({
  item_id: z.string(),
  name: z.string().nonempty("Name is required"),
  title: z.string().optional(),
  price: z
    .number()
    .positive("Price must be a positive number")
    .nonnegative("Price must be a non-negative number"),
  description: z.string().optional(),
  icon: z
    .object({
      name: z.custom<IconName>(),
      prefix: z.custom<IconPrefix>(),
    })
    .optional(),
  type: z.enum(["solo", "group", "class"], {
    required_error: "Type is required",
  }),
  class_id: z.string(),
  achievements: z
    .array(
      z.object({
        id: z.string().optional(), // Optional for existing achievements
        threshold: z
          .number()
          .int()
          .nonnegative("Threshold must be a non-negative integer"),
        name: z.string().nonempty("Achievement name is required"),
      }),
    )
    .optional(),
});

type EditRewardItemFormData = z.infer<typeof editRewardItemFormSchema>;

const EditRewardItemDialog: React.FC<EditRewardItemDialogProps> = ({
  isOpen,
  onClose,
  rewardItem,
  onUpdate,
}) => {
  console.log("🚀 ~ rewardItem:", rewardItem);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<EditRewardItemFormData>({
    resolver: zodResolver(editRewardItemFormSchema),
    defaultValues: {
      item_id: rewardItem.item_id,
      name: rewardItem.name,
      title: rewardItem.title ?? "",
      price: rewardItem.price,
      description: rewardItem.description ?? "",
      icon: rewardItem.icon
        ? {
            name: rewardItem.icon.split(" ")[1] as IconName,
            prefix: rewardItem.icon.split(" ")[0] as IconPrefix,
          }
        : undefined,
      type: rewardItem.type,
      class_id: rewardItem.class_id,
      achievements: rewardItem.achievements ?? [],
    },
  });

  const {
    fields: achievementFields,
    append: appendAchievement,
    remove: removeAchievement,
  } = useFieldArray({
    control,
    name: "achievements",
  });

  // Update form values when the rewardItem prop changes
  useEffect(() => {
    reset({
      item_id: rewardItem.item_id,
      name: rewardItem.name,
      title: rewardItem.title ?? "",
      price: rewardItem.price,
      description: rewardItem.description ?? "",
      icon: rewardItem.icon
        ? {
            name: rewardItem.icon.split(" ")[1] as IconName,
            prefix: rewardItem.icon.split(" ")[0] as IconPrefix,
          }
        : undefined,
      type: rewardItem.type,
      class_id: rewardItem.class_id,
      achievements: rewardItem.achievements ?? [],
    });
  }, [rewardItem, reset]);

  const onSubmit = async (data: EditRewardItemFormData) => {
    const updatedRewardItem: RewardItemUpdate = {
      item_id: data.item_id,
      name: data.name,
      title: data.title ?? null,
      price: data.price,
      description: data.description ?? null,
      icon: data.icon ? `${data.icon.prefix} ${data.icon.name}` : null,
      type: data.type,
      class_id: data.class_id,
      achievements: data.achievements?.map((ach) => ({
        id: ach.id,
        threshold: ach.threshold,
        name: ach.name,
      })),
      user_id: rewardItem.user_id, // Assuming user_id remains unchanged
      updated_date: new Date().toISOString(),
    };
    try {
      const result = await updateRewardItem(updatedRewardItem);
      if (result.success) {
        onUpdate();
        toast({
          title: "Success!",
          description: "Reward item updated successfully.",
        });
        onClose();
        reset();
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
    }
  };

  const handleSelectIcon = (iconName: IconName, prefix: IconPrefix) => {
    setValue("icon", { name: iconName, prefix });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Reward Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name and Title */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">
                Name<span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Reward Item Name"
                {...register("name")}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="title" className="mb-2 flex items-center gap-1">
                Title{" "}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <CircleHelp size={16} className="cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-md">
                        Titles are awarded to the first place student and
                        displayed publicly if the title is for a positive
                        behavior or reward item.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input id="title" placeholder="Title" {...register("title")} />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.title.message}
                </p>
              )}
            </div>
          </div>

          {/* Price */}
          <div>
            <Label htmlFor="price">
              Price<span className="text-red-500">*</span>
            </Label>
            <Input
              id="price"
              placeholder="Price"
              type="number"
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-500">
                {errors.price.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Description"
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Type */}
          <div>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <div>
                  <Label htmlFor="type">
                    Type<span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    value={field.value}
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
                    <p className="mt-1 text-sm text-red-500">
                      {errors.type.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          {/* Icon Picker */}
          <div>
            <Label>Icon</Label>
            <FAIconPicker
              selectedIcon={watch("icon")}
              onSelectIcon={handleSelectIcon}
            />
            {errors.icon && (
              <p className="mt-1 text-sm text-red-500">{errors.icon.message}</p>
            )}
          </div>

          {/* Achievements */}
          <div>
            <Label>Achievements</Label>
            <p className="mt-1 text-sm text-gray-500">
              Add thresholds and names for achievements.
            </p>
            {achievementFields.map((field, index) => (
              <div
                key={field.id}
                className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-5"
              >
                <div className="sm:col-span-2">
                  <Label htmlFor={`achievements.${index}.threshold`}>
                    Threshold<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`achievements.${index}.threshold`}
                    type="number"
                    placeholder="Threshold"
                    {...register(`achievements.${index}.threshold` as const, {
                      valueAsNumber: true,
                    })}
                  />
                  {errors.achievements?.[index]?.threshold && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.achievements[index]?.threshold?.message}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor={`achievements.${index}.name`}>
                    Achievement Name<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`achievements.${index}.name`}
                    placeholder="Achievement Name"
                    {...register(`achievements.${index}.name` as const)}
                  />
                  {errors.achievements?.[index]?.name && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.achievements[index]?.name?.message}
                    </p>
                  )}
                </div>
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeAchievement(index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              className="mt-4"
              onClick={() => appendAchievement({ threshold: 0, name: "" })}
            >
              Add Achievement
            </Button>
          </div>

          {/* Dialog Footer */}
          <DialogFooter>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRewardItemDialog;
