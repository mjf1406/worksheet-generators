"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { StudentData } from "~/app/api/getClassesGroupsStudents/route";
import type {
  Expectation,
  StudentExpectation,
  TeacherCourse,
} from "~/server/db/types";
import { Label } from "~/components/ui/label";
import { saveExpectation } from "../actions/saveExpectation";
import { useToast } from "~/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface EditSingleExpectationDialogProps {
  student: StudentData;
  expectation: Expectation;
  studentExpectation?: StudentExpectation;
  classId: string;
  onClose: () => void;
}

interface SaveError extends Error {
  message: string;
}

interface SaveExpectationParams {
  class_id: string;
  student_id: string;
  expectation_id: string;
  value?: string;
  number?: number;
}

export default function EditSingleExpectationDialog({
  student,
  expectation,
  studentExpectation,
  classId,
  onClose,
}: EditSingleExpectationDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [value, setValue] = useState(studentExpectation?.value ?? "");
  const [numberVal, setNumberVal] = useState(studentExpectation?.number ?? 0);

  const saveExpectationMutation = useMutation({
    mutationFn: async (data: SaveExpectationParams) => {
      const result = await saveExpectation(data);
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
      const optimisticExpectation: Partial<StudentExpectation> = {
        class_id: classId,
        student_id: student.student_id,
        expectation_id: expectation.id,
        value: newExpectation.value ?? undefined,
        number: newExpectation.number ?? undefined,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      };

      // Optimistically update the cache
      queryClient.setQueryData<TeacherCourse[]>(["classes"], (old = []) => {
        return old.map((course) => {
          if (course.class_id === classId) {
            return {
              ...course,
              student_expectations: course.student_expectations
                .filter(
                  (exp) =>
                    exp.student_id !== student.student_id ||
                    exp.expectation_id !== expectation.id,
                )
                .concat(optimisticExpectation as StudentExpectation),
            };
          }
          return course;
        });
      });

      return { previousClasses };
    },
    onError: (err, newExpectation, context) => {
      // Revert to the previous value on error
      queryClient.setQueryData(["classes"], context?.previousClasses);

      const error = err as SaveError;
      toast({
        title: "Error",
        description:
          error.message || "There was an issue saving the expectation.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "The expectation was saved successfully.",
      });
      onClose();
    },
    onSettled: () => {
      // Refetch to ensure cache is in sync
      void queryClient.invalidateQueries({
        queryKey: ["classes"],
      });
    },
  });

  const handleSave = () => {
    saveExpectationMutation.mutate({
      class_id: classId,
      student_id: student.student_id,
      expectation_id: expectation.id,
      value: value || undefined,
      number: numberVal || undefined,
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Editing {expectation.name} for {student.student_name_first_en}{" "}
            {student.student_name_last_en}
          </DialogTitle>
          <DialogDescription>
            Make changes to the selected expectation and click &quot;Save&quot;
            to apply.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div>
            <p>{expectation.name}</p>
            {expectation.description && (
              <p className="mb-4 text-sm italic text-gray-600">
                {expectation.description}
              </p>
            )}
          </div>

          <div>
            <Label className="text-sm text-gray-600">Value</Label>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter expectation value"
              disabled={saveExpectationMutation.isPending}
            />
          </div>

          <div>
            <Label className="text-sm text-gray-600">Number</Label>
            <Input
              type="number"
              value={numberVal}
              onChange={(e) => setNumberVal(Number(e.target.value))}
              placeholder="Enter expectation number"
              disabled={saveExpectationMutation.isPending}
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={saveExpectationMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveExpectationMutation.isPending}
          >
            {saveExpectationMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
