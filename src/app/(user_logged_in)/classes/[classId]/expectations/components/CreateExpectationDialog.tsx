"use client";

import React from "react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { useToast } from "~/components/ui/use-toast";
import { Plus } from "lucide-react";
import { createExpectation } from "../actions/createExpectation";
import { Label } from "~/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Expectation, TeacherCourse } from "~/server/db/types";

interface CreateExpectationProps {
  classId: string;
}

interface CreateExpectationParams {
  classId: string;
  name: string;
  description: string;
}

interface CreateExpectationResult {
  success: boolean;
  message?: string;
  expectation?: Expectation;
}

export const CreateExpectationDialog: React.FC<CreateExpectationProps> = ({
  classId,
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createExpectationMutation = useMutation({
    mutationFn: async (
      data: CreateExpectationParams,
    ): Promise<CreateExpectationResult> => {
      const result = await createExpectation(data);
      if (!result?.success) {
        throw new Error("Failed to create expectation");
      }
      return result;
    },
    onMutate: async (newExpectation) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["classes"],
      });

      // Snapshot the previous value
      const previousClasses = queryClient.getQueryData<TeacherCourse[]>([
        "classes",
      ]);

      // Create optimistic expectation
      const optimisticExpectation: Partial<Expectation> = {
        id: `temp-${Date.now()}`, // Temporary ID until server responds
        class_id: classId,
        name: newExpectation.name,
        description: newExpectation.description,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      };

      // Optimistically update the cache
      queryClient.setQueryData<TeacherCourse[]>(["classes"], (old = []) => {
        return old.map((course) => {
          if (course.class_id === classId) {
            return {
              ...course,
              expectations: [
                ...(course.expectations || []),
                optimisticExpectation as Expectation,
              ],
            };
          }
          return course;
        });
      });

      return { previousClasses };
    },
    onError: (error, variables, context) => {
      // Revert to the previous value on error
      queryClient.setQueryData(["classes"], context?.previousClasses);

      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expectation created successfully!",
      });
      setOpen(false);
      resetForm();
    },
    onSettled: () => {
      // Refetch to ensure cache is in sync
      void queryClient.invalidateQueries({
        queryKey: ["classes"],
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !description.trim()) {
      toast({
        title: "Error",
        description: "Name and description are required",
        variant: "destructive",
      });
      return;
    }

    createExpectationMutation.mutate({
      classId,
      name: name.trim(),
      description: description.trim(),
    });
  };

  const resetForm = () => {
    setName("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Expectation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Expectation</DialogTitle>
            <DialogDescription>
              Add a new expectation for this class. Fill out the name and
              description below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name*
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="A short, memorable name"
                required
                disabled={createExpectationMutation.isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description*
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="An explanation of the expectation in student-friendly language"
                required
                disabled={createExpectationMutation.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={createExpectationMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createExpectationMutation.isPending}
            >
              {createExpectationMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
