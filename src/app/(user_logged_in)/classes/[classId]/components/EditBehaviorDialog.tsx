// EditBehaviorDialog.tsx

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
import { updateBehavior } from "../behaviorActions";
import { toast } from "~/components/ui/use-toast";
import type { IconName, IconPrefix } from "@fortawesome/fontawesome-svg-core";
import FAIconPicker from "~/components/pickers/FontAwesomeIconPicker";
import ColorPicker from "~/components/pickers/ShadcnColorPicker";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "~/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { CircleHelp } from "lucide-react";

// Define the Achievement interface
interface Achievement {
  id?: string; // Optional for existing achievements
  threshold: number;
  name: string;
}

// Define the Behavior interface to include achievements
export type BehaviorNew = {
  behavior_id: string;
  name: string;
  title?: string | null;
  point_value: number;
  description?: string | null;
  icon?: string | null;
  color?: string;
  class_id?: string;
  user_id: string;
  created_date: string;
  updated_date: string;
  achievements?: Achievement[];
};

interface EditBehaviorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  behavior: BehaviorNew;
  onUpdate: () => void;
}

// Define the Zod schema for validation
const editBehaviorFormSchema = z.object({
  behavior_id: z.string(),
  name: z.string().nonempty("Name is required"),
  title: z.string().optional(),
  point_value: z.number().int(),
  description: z.string().optional(),
  icon: z
    .object({
      name: z.custom<IconName>(),
      prefix: z.custom<IconPrefix>(),
    })
    .optional(),
  color: z.string(),
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

type EditBehaviorFormData = z.infer<typeof editBehaviorFormSchema>;

const EditBehaviorDialog: React.FC<EditBehaviorDialogProps> = ({
  isOpen,
  onClose,
  behavior,
  onUpdate,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
    reset,
  } = useForm<EditBehaviorFormData>({
    resolver: zodResolver(editBehaviorFormSchema),
    defaultValues: {
      behavior_id: behavior.behavior_id,
      name: behavior.name,
      title: behavior.title ?? "",
      point_value: behavior.point_value,
      description: behavior.description ?? "",
      icon: behavior.icon
        ? {
            name: behavior.icon.split(" ")[1] as IconName,
            prefix: behavior.icon.split(" ")[0] as IconPrefix,
          }
        : undefined, // Changed from null to undefined
      color: behavior.color ?? "#000000",
      class_id: behavior.class_id ?? "",
      achievements: behavior.achievements ?? [],
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

  // Update form values when the behavior prop changes
  useEffect(() => {
    reset({
      behavior_id: behavior.behavior_id,
      name: behavior.name,
      title: behavior.title ?? "",
      point_value: behavior.point_value,
      description: behavior.description ?? "",
      icon: behavior.icon
        ? {
            name: behavior.icon.split(" ")[1] as IconName,
            prefix: behavior.icon.split(" ")[0] as IconPrefix,
          }
        : undefined, // Changed from null to undefined
      color: behavior.color ?? "#000000",
      class_id: behavior.class_id ?? "",
      achievements: behavior.achievements ?? [],
    });
  }, [behavior, reset]);

  const onSubmit = async (data: EditBehaviorFormData) => {
    const formattedData: BehaviorNew = {
      behavior_id: data.behavior_id,
      name: data.name,
      title: data.title ?? null,
      point_value: data.point_value,
      description: data.description ?? undefined,
      icon: data.icon ? `${data.icon.prefix} ${data.icon.name}` : undefined, // Changed from null to undefined
      color: data.color,
      class_id: data.class_id,
      user_id: behavior.user_id, // Assuming user_id remains unchanged
      created_date: behavior.created_date, // Preserving original creation date
      updated_date: new Date().toISOString(),
      achievements: data.achievements?.map((ach) => ({
        id: ach.id,
        threshold: ach.threshold,
        name: ach.name,
      })),
    };

    try {
      const result = await updateBehavior(formattedData);

      if (result.success) {
        onUpdate();
        toast({
          title: "Success!",
          description: "Behavior updated successfully.",
        });
        onClose();
        reset(); // Reset the form after successful submission
      } else {
        console.error(result.message);
        toast({
          title: "Error!",
          description: result.message ?? "Failed to update the behavior.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Update Error:", error);
      toast({
        title: "Error!",
        description: "Failed to save the behavior. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectIcon = (iconName: IconName, prefix: IconPrefix) => {
    setValue("icon", { name: iconName, prefix });
  };

  const handleSelectColor = (color: string) => {
    setValue("color", color);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Behavior</DialogTitle>
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
                placeholder="Behavior Name"
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

          {/* Point Value */}
          <div>
            <Label htmlFor="point_value">
              Point Value<span className="text-red-500">*</span>
            </Label>
            <Input
              id="point_value"
              placeholder="Point Value"
              type="number"
              {...register("point_value", { valueAsNumber: true })}
            />
            {errors.point_value && (
              <p className="mt-1 text-sm text-red-500">
                {errors.point_value.message}
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

          {/* Icon and Color Picker */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Icon</Label>
              <FAIconPicker
                selectedIcon={watch("icon")} // Now either { name, prefix } or undefined
                onSelectIcon={handleSelectIcon}
              />
              {errors.icon && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.icon.message}
                </p>
              )}
            </div>
            <div>
              <Label>Color</Label>
              <ColorPicker
                selectedColor={watch("color")}
                onSelectColor={handleSelectColor}
              />
              {errors.color && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.color.message}
                </p>
              )}
            </div>
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
                      valueAsNumber: true, // Ensure threshold is treated as number
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
            <Button variant="secondary" onClick={onClose} disabled={false}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBehaviorDialog;
