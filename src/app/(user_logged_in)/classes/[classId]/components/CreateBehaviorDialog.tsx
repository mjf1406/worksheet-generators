// CreateBehaviorDialog.tsx

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
import FAIconPicker from "~/components/pickers/FontAwesomeIconPicker";
import ColorPicker from "~/components/pickers/ShadcnColorPicker";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { IconName, IconPrefix } from "@fortawesome/fontawesome-svg-core";
import type { BehaviorData } from "./StudentDialog";
import { Label } from "~/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { CircleHelp } from "lucide-react";

interface CreateBehaviorDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateBehavior: (behaviorData: BehaviorData) => Promise<void>;
  classId: string;
}

const behaviorFormSchema = z.object({
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
  achievements: z
    .array(
      z.object({
        threshold: z
          .number()
          .int()
          .nonnegative("Threshold must be a non-negative integer"),
        name: z.string().nonempty("Achievement name is required"),
      }),
    )
    .optional(),
});

type BehaviorFormData = z.infer<typeof behaviorFormSchema>;

const CreateBehaviorDialog: React.FC<CreateBehaviorDialogProps> = ({
  open,
  onClose,
  onCreateBehavior,
  classId,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
    reset,
  } = useForm<BehaviorFormData>({
    resolver: zodResolver(behaviorFormSchema),
    defaultValues: {
      name: "",
      title: "",
      point_value: 1,
      description: "",
      icon: undefined,
      color: "#000000",
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

  const onSubmit = async (data: BehaviorFormData) => {
    const newBehavior: BehaviorData = {
      name: data.name,
      title: data.title ?? undefined,
      point_value: data.point_value, // Use point_value directly
      description: data.description ?? undefined,
      icon: data.icon
        ? { prefix: data.icon.prefix, name: data.icon.name }
        : { prefix: "fas", name: "circle-question" },
      color: data.color,
      class_id: classId,
      achievements: data.achievements ?? undefined,
    };
    try {
      await onCreateBehavior(newBehavior);
      onClose();
      reset();
    } catch (error) {
      console.error("Error creating behavior:", error);
      // Handle error (e.g., show a toast or error message)
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Behavior</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name and Title */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">
                Name<span className="text-red-500">*</span>
              </Label>
              <Input id="name" placeholder="Name" {...register("name")} />
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
                selectedIcon={watch("icon")}
                onSelectIcon={(name, prefix) =>
                  setValue("icon", { name, prefix })
                }
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
                onSelectColor={(color) => setValue("color", color)}
              />
              {errors.color && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.color.message}
                </p>
              )}
            </div>
          </div>

          {/* Achievements */}
          {/* <div>
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
                  <Input
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

export default CreateBehaviorDialog;
