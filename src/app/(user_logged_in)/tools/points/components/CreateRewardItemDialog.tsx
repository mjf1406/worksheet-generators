// app/(user_logged_in)/points/components/CreateRewardItemDialog.tsx

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

const createRewardItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number(),
  icon: z.string().optional(),
});

type CreateRewardItemFormData = z.infer<typeof createRewardItemSchema>;

const CreateRewardItemDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<CreateRewardItemFormData>({
    resolver: zodResolver(createRewardItemSchema),
    defaultValues: {
      name: "",
      price: 0,
      icon: "",
    },
  });

  const onSubmit = async (data: CreateRewardItemFormData) => {
    try {
      // Handle create reward item action
      // Call backend API to create reward item
      // Example: await createRewardItemAction(data);
      toast({
        title: "Success",
        description: "Reward item created successfully.",
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
      console.error("Error creating reward item:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create Reward Item</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Create Reward Item</DialogTitle>
        <DialogDescription>
          Fill out the form below to create a new reward item.
        </DialogDescription>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register("name")} />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                {...form.register("price", { valueAsNumber: true })}
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

export default CreateRewardItemDialog;
