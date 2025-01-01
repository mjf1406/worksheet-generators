"use client";

import React, { Suspense, useState } from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { GoogleClassOptions } from "~/app/api/queryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";

// Types for your props:
interface ClassListProps {
  // Called whenever a user toggles a classroom
  //   Pass `undefined` if user unchecks or selects nothing
  onCourseSelected?: (courseId: string | undefined) => void;
}

function ClassList({ onCourseSelected }: ClassListProps) {
  const { data: courses = [] } = useSuspenseQuery(GoogleClassOptions);

  // Keep local state for whichever course is currently "checked"
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(
    undefined,
  );

  // Handler to toggle checkbox:
  //  - If the user clicks a checkbox that isn't selected, select that course
  //  - If the user clicks the same checkbox again, unselect it
  const handleCheckboxChange = (courseId: string) => {
    setSelectedCourseId((prev) => {
      // If clicking the already-selected course, unselect it
      if (prev === courseId) {
        onCourseSelected?.(undefined);
        return undefined;
      }
      // Otherwise, select this new course
      onCourseSelected?.(courseId);
      return courseId;
    });
  };

  return (
    <div className="m-auto flex w-full flex-col gap-5">
      <div className="flex flex-col gap-2 rounded-xl p-2">
        {courses.map((course) => {
          const isCourseSelected = selectedCourseId === course.id;
          const isDisabled = course.students.length === 0;

          return (
            <div
              key={course.id}
              className="m-auto flex w-full gap-10 rounded-2xl bg-card-foreground/10 p-3"
            >
              <div
                className={`flex flex-1 items-center justify-start gap-4 self-start ${
                  isDisabled ? "opacity-50" : ""
                }`}
              >
                <Checkbox
                  id={"name-" + course.id}
                  disabled={isDisabled}
                  // True if this course is currently selected
                  checked={isCourseSelected}
                  // Called whenever the user toggles the checkbox
                  onCheckedChange={() => handleCheckboxChange(course.id)}
                />
                <div className="text-xl font-bold">
                  <label
                    htmlFor={"name-" + course.id}
                    className="leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {course.name}
                  </label>
                </div>
              </div>
              <div className="m-auto flex h-full flex-1 items-end justify-end gap-2 self-end">
                {isDisabled && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TriangleAlert className="text-red-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{course.name} has no students!</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Wrapper component with Suspense fallback
export default function ClassListWrapper({ onCourseSelected }: ClassListProps) {
  return (
    <Suspense
      fallback={
        <div className="m-auto flex w-full flex-col gap-5">
          <div className="m-auto flex w-full gap-10 rounded-2xl bg-card-foreground/10 p-3">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading Google Classroom classes...</span>
            </div>
          </div>
        </div>
      }
    >
      <ClassList onCourseSelected={onCourseSelected} />
    </Suspense>
  );
}
