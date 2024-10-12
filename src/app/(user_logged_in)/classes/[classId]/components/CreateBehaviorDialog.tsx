// CreateBehaviorDialog.tsx

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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { IconName, IconPrefix } from "@fortawesome/fontawesome-svg-core";
import type { BehaviorData } from "./StudentDialog";

interface CreateBehaviorDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateBehavior: (behaviorData: BehaviorData) => Promise<void>;
  classId: string;
}

const behaviorFormSchema = z.object({
  name: z.string().nonempty("Name is required"),
  point_value: z.preprocess(
    (val) => parseInt(val as string, 10),
    z.number().int(),
  ),
  description: z.string().optional(),
  icon: z.object({
    name: z.custom<IconName>(),
    prefix: z.custom<IconPrefix>(),
  }),
  color: z.string(),
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
    formState: { errors },
    reset,
  } = useForm<BehaviorFormData>({
    resolver: zodResolver(behaviorFormSchema),
    defaultValues: {
      name: "",
      point_value: 1,
      description: "",
      icon: undefined,
      color: "#000000",
    },
  });

  const onSubmit = (data: BehaviorFormData) => {
    const newBehavior = {
      name: data.name,
      point_value: data.point_value,
      description: data.description ?? null,
      icon: data.icon ? `${data.icon.prefix} ${data.icon.name}` : null,
      color: data.color,
      class_id: classId,
    };
    console.log("🚀 ~ onSubmit ~ newBehavior:", newBehavior);
    void onCreateBehavior(newBehavior as unknown as BehaviorData);
    onClose();
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Behavior</DialogTitle>
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
              placeholder="Point Value"
              type="number"
              {...register("point_value")}
            />
            {errors.point_value && (
              <p className="text-red-500">{errors.point_value.message}</p>
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
            <ColorPicker
              selectedColor={watch("color")}
              onSelectColor={(color) => setValue("color", color)}
            />
            {errors.color && (
              <p className="text-red-500">{errors.color.message}</p>
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

export default CreateBehaviorDialog;
