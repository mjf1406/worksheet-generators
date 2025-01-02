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
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { IconName, IconPrefix } from "@fortawesome/fontawesome-svg-core";
import { Switch } from "~/components/ui/switch"; // Assuming you have a Switch component

interface CreateRewardItemDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateRewardItem: (rewardItemData: RewardItemData) => Promise<void>;
  classId: string;
}

const createRewardItemSchema = z.object({
  name: z.string().nonempty("Name is required"),
  title: z.string().optional(),
  price: z.preprocess(
    (val) => parseFloat(val as string),
    z
      .number()
      .positive("Price must be a positive number")
      .nonnegative("Price must be a positive number"),
  ),
  description: z.string().optional(),
  icon: z
    .object({
      name: z.custom<IconName>(),
      prefix: z.custom<IconPrefix>(),
    })
    .optional(),
  type: z.enum(["solo", "group", "class"]),
  achievements: z
    .array(
      z.object({
        threshold: z.preprocess(
          (val) => parseInt(val as string, 10),
          z
            .number()
            .nonnegative("Threshold must be a non-negative number")
            .int("Threshold must be an integer"),
        ),
        name: z.string().nonempty("Achievement name is required"),
      }),
    )
    .optional(),
});

export type RewardItemFormData = z.infer<typeof createRewardItemSchema>;

export type RewardItemData = {
  name: string;
  title?: string | undefined;
  price: number;
  description?: string | null;
  icon?: string | null;
  type: "solo" | "group" | "class";
  class_id: string | null;
  achievements?: { threshold: number; name: string }[] | null | undefined;
};

const CreateRewardItemDialog: React.FC<CreateRewardItemDialogProps> = ({
  open,
  onClose,
  onCreateRewardItem,
  classId,
}) => {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<RewardItemFormData>({
    resolver: zodResolver(createRewardItemSchema),
    defaultValues: {
      name: "",
      title: "",
      price: 1,
      description: "",
      icon: undefined,
      type: "solo",
      achievements: [],
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

  const onSubmit = async (data: RewardItemFormData) => {
    const newRewardItem: RewardItemData = {
      name: data.name,
      title: data.title ?? undefined,
      price: data.price,
      description: data.description ?? null,
      icon: data.icon
        ? `${data.icon.prefix} ${data.icon.name}`
        : "fas circle-question",
      type: data.type,
      class_id: classId,
      achievements: data.achievements ?? null,
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name and Title */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name<span className="text-red-500">*</span>
              </label>
              <Input placeholder="Name" {...register("name")} />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <Input placeholder="Title" {...register("title")} />
              <p className="mt-1 text-sm text-gray-500">
                Titles are displayed publicly if positive.
              </p>
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.title.message}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <Textarea placeholder="Description" {...register("description")} />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Price and Type */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price<span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Price"
                type="number"
                {...register("price")}
                min={1}
                defaultValue={1}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.price.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type<span className="text-red-500">*</span>
              </label>
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
                <p className="mt-1 text-sm text-red-500">
                  {errors.type.message}
                </p>
              )}
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Icon
            </label>
            <FAIconPicker
              selectedIcon={watch("icon")}
              onSelectIcon={(name, prefix) =>
                setValue("icon", { name, prefix })
              }
            />
            {errors.icon && (
              <p className="mt-1 text-sm text-red-500">{errors.icon.message}</p>
            )}
          </div>

          {/* Achievements */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700">
              Achievements
            </label>
            <p className="mt-1 text-sm text-gray-500">
              Add thresholds and names for achievements.
            </p>
            {achievementFields.map((field, index) => (
              <div
                key={field.id}
                className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-5"
              >
                <div className="sm:col-span-2">
                  <Input
                    type="number"
                    placeholder="Threshold"
                    {...register(`achievements.${index}.threshold` as const)}
                  />
                  {errors.achievements?.[index]?.threshold && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.achievements[index]?.threshold?.message}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Input
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
          </div> */}

          {/* Dialog Footer */}
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
