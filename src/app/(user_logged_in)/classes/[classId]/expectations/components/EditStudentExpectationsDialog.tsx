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
import type { StudentExpectation, Expectation } from "~/server/db/types";
import type { StudentData } from "~/app/api/getClassesGroupsStudents/route";

interface EditStudentExpectationsDialogProps {
  student: StudentData;
  expectations: Expectation[];
  studentExpectations: StudentExpectation[];
  classId: string;
  onClose: () => void;
}

export default function EditStudentExpectationsDialog({
  student,
  expectations,
  studentExpectations,
  classId,
  onClose,
}: EditStudentExpectationsDialogProps) {
  // We'll store all the student's expectations in local state.
  // This should include entries for ALL expectations - if no student expectation exists for a given expectation_id, we create a placeholder.
  const [localExpectations, setLocalExpectations] = useState<
    StudentExpectation[]
  >(() => {
    // Create a map from expectation_id -> StudentExpectation if exists
    const existingMap = new Map<string, StudentExpectation>();
    for (const se of studentExpectations) {
      existingMap.set(se.expectation_id, se);
    }

    // For every expectation, ensure we have a StudentExpectation entry
    return expectations.map((exp) => {
      if (existingMap.has(exp.id)) {
        return existingMap.get(exp.id)!;
      } else {
        // Create a new placeholder StudentExpectation
        return {
          id: crypto.randomUUID(), // temporary ID for the local state
          expectation_id: exp.id,
          student_id: student.student_id,
          user_id: "", // Set user_id properly if needed
          class_id: classId,
          value: "",
          number: undefined,
          created_date: new Date().toISOString(),
          updated_date: new Date().toISOString(),
        };
      }
    });
  });

  const handleChange = (
    expectationId: string,
    field: "value" | "number",
    newValue: string,
  ) => {
    setLocalExpectations((prev) =>
      prev.map((exp) =>
        exp.expectation_id === expectationId
          ? {
              ...exp,
              [field]: field === "number" ? Number(newValue) : newValue,
            }
          : exp,
      ),
    );
  };

  const handleSave = async () => {
    // TODO: Integrate your Next.js 14 server action here to save the updated expectations.
    // e.g. await updateStudentExpectations(classId, localExpectations)
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Edit Expectations for {student.student_name_first_en}{" "}
            {student.student_name_last_en}
          </DialogTitle>
          <DialogDescription>
            Make changes to the student expectations below and click
            &quot;Save&quot; to apply.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {expectations.map((exp) => {
            const studentExp = localExpectations.find(
              (se) => se.expectation_id === exp.id,
            );
            const value = studentExp?.value ?? "";
            const numberVal = studentExp?.number ?? 0;

            return (
              <div
                key={exp.id}
                className="flex flex-col gap-2 rounded border p-4"
              >
                <span className="font-medium">{exp.name}</span>
                {exp.description && (
                  <span className="text-sm italic text-gray-600">
                    {exp.description}
                  </span>
                )}

                {/* Value field */}
                <label className="text-sm text-gray-600">Value</label>
                <Input
                  value={value}
                  onChange={(e) =>
                    handleChange(exp.id, "value", e.target.value)
                  }
                  placeholder="Enter expectation value"
                />

                {/* Number field */}
                <label className="text-sm text-gray-600">Number</label>
                <Input
                  type="number"
                  value={numberVal}
                  onChange={(e) =>
                    handleChange(exp.id, "number", e.target.value)
                  }
                  placeholder="Enter expectation number"
                />
              </div>
            );
          })}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
