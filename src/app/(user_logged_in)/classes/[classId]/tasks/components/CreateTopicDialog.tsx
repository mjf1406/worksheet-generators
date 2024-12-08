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
import { Plus, Loader2 } from "lucide-react";
import { createTopic } from "../actions/topicsActions";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { classesOptions } from "~/app/api/queryOptions";

export default function CreateTopicDialog() {
  const params = useParams();
  const classId = params.classId as string;

  const [open, setOpen] = React.useState(false);
  const [topicName, setTopicName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createTopic,
    onSuccess: async (result) => {
      if (!result.success) {
        setError(result.message);
        return;
      }

      // Invalidate to refetch data
      await queryClient.invalidateQueries({
        queryKey: classesOptions.queryKey,
      });

      setError(null);
      setOpen(false);
      setTopicName("");
    },
    onError: (error) => {
      setError(
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate({ classId, name: topicName });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Plus className="mr-2" /> Create Topic
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create a Topic</DialogTitle>
          <DialogDescription>Enter a name for the new topic.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="text-sm text-red-500">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="topic-name">Name</Label>
            <Input
              id="topic-name"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              placeholder="Topic name"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {mutation.isPending ? "Creating..." : "Create Topic"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
