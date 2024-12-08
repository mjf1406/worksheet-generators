"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { CalendarIcon, Plus, Loader2 } from "lucide-react";
// import { format } from "date-fns";
import type { Topic } from "~/server/db/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { classesOptions } from "~/app/api/queryOptions";
import { createAssignment } from "../actions/assignmentsActions";

interface CreateAssignmentsDialogProps {
  topics: Topic[];
}

type AssignmentInput = {
  name: string; // required
  description: string; // optional
  data: string; // optional
  due_date: string; // optional
  topic: string; // optional
  working_date: string | undefined; // optional
};

// function formatDateString(date: Date | null): string {
//   return date ? format(date, "yyyy-MM-dd") : "";
// }

export default function CreateAssignmentsDialog({
  topics,
}: CreateAssignmentsDialogProps) {
  const params = useParams();
  const classId = params.classId as string;

  const [open, setOpen] = React.useState(false);
  const [assignments, setAssignments] = React.useState<AssignmentInput[]>([
    {
      name: "",
      description: "",
      data: "",
      due_date: "",
      topic: "",
      working_date: "",
    },
  ]);

  const [error, setError] = React.useState<string | null>(null);

  const queryClient = useQueryClient();

  const sortedTopics = React.useMemo(
    () =>
      [...topics].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      ),
    [topics],
  );

  const handleFieldChange = (
    index: number,
    field: keyof AssignmentInput,
    value: string,
  ) => {
    setAssignments((prev) => {
      const copy = [...prev];
      if (index >= 0 && index < copy.length) {
        copy[index]![field] = value;
      }
      return copy;
    });
  };

  const addAssignment = () => {
    setAssignments((prev) => [
      ...prev,
      {
        name: "",
        description: "",
        data: "",
        due_date: "",
        topic: "",
        working_date: "",
      },
    ]);
  };

  const removeAssignment = (index: number) => {
    setAssignments((prev) => prev.filter((_, i) => i !== index));
  };

  const mutation = useMutation({
    mutationFn: async ({
      classId,
      assignments,
    }: {
      classId: string;
      assignments: AssignmentInput[];
    }) => {
      for (const assignment of assignments) {
        const result = await createAssignment({
          classId,
          name: assignment.name,
          description: assignment.description || null,
          data: assignment.data || null,
          due_date: assignment.due_date || null,
          topic: assignment.topic || null,
          working_date: assignment.working_date ?? null,
        });

        if (!result.success) {
          throw new Error(result.message);
        }
      }
      return {
        success: true,
        message: "All assignments created successfully.",
      };
    },
    onSuccess: async (result) => {
      if (!result.success) {
        setError(result.message);
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: classesOptions.queryKey,
      });

      setError(null);
      setOpen(false);
      setAssignments([
        {
          name: "",
          description: "",
          data: "",
          due_date: "",
          topic: "",
          working_date: "",
        },
      ]);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate({ classId, assignments });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2" /> Create Task(s)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Multiple Tasks</DialogTitle>
          <DialogDescription>
            Add one or more tasks below. You can then submit them all at once.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="max-h-[60vh] space-y-6 overflow-auto pr-2"
        >
          {error && <div className="text-sm text-red-500">{error}</div>}
          {assignments.map((assignment, index) => (
            <div
              key={index}
              className="relative space-y-4 rounded-md border p-4"
            >
              {assignments.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute right-2 top-2 text-red-500"
                  onClick={() => removeAssignment(index)}
                >
                  Remove
                </Button>
              )}
              <div className="space-y-2">
                <Label htmlFor={`name-${index}`}>Name (required)</Label>
                <Input
                  id={`name-${index}`}
                  value={assignment.name}
                  onChange={(e) =>
                    handleFieldChange(index, "name", e.target.value)
                  }
                  placeholder="Task name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`description-${index}`}>
                  Description (optional)
                </Label>
                <Textarea
                  id={`description-${index}`}
                  value={assignment.description}
                  onChange={(e) =>
                    handleFieldChange(index, "description", e.target.value)
                  }
                  placeholder="Task description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`data-${index}`}>Data (optional)</Label>
                <Textarea
                  id={`data-${index}`}
                  value={assignment.data}
                  onChange={(e) =>
                    handleFieldChange(index, "data", e.target.value)
                  }
                  placeholder="Additional data (e.g., resource links)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`due_date-${index}`}>Due Date (optional)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id={`due_date-${index}`}
                    type="date"
                    value={assignment.due_date}
                    onChange={(e) =>
                      handleFieldChange(index, "due_date", e.target.value)
                    }
                  />
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`topic-${index}`}>Topic (optional)</Label>
                <Select
                  value={assignment.topic}
                  onValueChange={(val) =>
                    handleFieldChange(index, "topic", val)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedTopics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id}>
                        {topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`working_date-${index}`}>
                  Working Date (optional)
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id={`working_date-${index}`}
                    type="date"
                    value={assignment.working_date}
                    onChange={(e) =>
                      handleFieldChange(index, "working_date", e.target.value)
                    }
                  />
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>
          ))}
          <div>
            <Button type="button" variant="secondary" onClick={addAssignment}>
              Add Another Task
            </Button>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {mutation.isPending ? "Submitting..." : "Submit Task(s)"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
