// app/(user_logged_in)/points/components/CreateBehaviorDialog.tsx

"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useToast } from "~/components/ui/use-toast";
import FAIconPicker from "~/components/pickers/FontAwesomeIconPicker";

const createBehaviorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  point_value: z.number(),
  icon: z.string().optional(),
});

type CreateBehaviorFormData = z.infer<typeof createBehaviorSchema>;

const CreateBehaviorDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<CreateBehaviorFormData>({
    resolver: zodResolver(createBehaviorSchema),
    defaultValues: {
      name: "",
      point_value: 0,
      icon: "",
    },
  });

  const onSubmit = async (data: CreateBehaviorFormData) => {
    try {
      // Handle create behavior action
      // Call backend API to create behavior
      // Example: await createBehaviorAction(data);
      toast({
        title: "Success",
        description: "Behavior created successfully.",
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
      console.error("Error creating behavior:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create Behavior</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Create Behavior</DialogTitle>
        <DialogDescription>
          Fill out the form below to create a new behavior.
        </DialogDescription>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register("name")} />
            </div>
            <div>
              <Label htmlFor="point_value">Point Value</Label>
              <Input
                id="point_value"
                type="number"
                {...form.register("point_value", { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label>Icon</Label>
              <FAIconPicker
                onSelectIcon={(iconName, prefix) =>
                  form.setValue("icon", `${prefix} ${iconName}`)
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBehaviorDialog;
