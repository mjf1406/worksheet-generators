"use client";

import React, { useEffect, useState } from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface Course {
  id?: string;
  name?: string;
  section?: string;
  descriptionHeading?: string;
  room?: string;
  ownerId?: string;
  students: [];
}

async function fetchClassroomData(): Promise<Course[]> {
  try {
    const response = await fetch("/api/GoogleClasses");
    if (!response.ok) {
      throw new Error("Failed to fetch classroom data");
    }
    const data = await response.json();
    return data as Course[];
  } catch (error) {
    console.error("Error fetching classroom data:", error);
    return [];
  }
}

export default function ClassList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClassroomData().then((data) => {
      setCourses(data);
      setIsLoading(false);
    });
  }, []);

  console.log("🚀 ~ ClassList ~ courses:", courses);

  if (isLoading) {
    return (
      <div className="m-auto flex w-full flex-col gap-5">
        <div className="m-auto flex w-full gap-10 rounded-2xl bg-card-foreground/10 p-3">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading classes...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="m-auto flex w-full flex-col gap-5">
      <div className="flex flex-col gap-2 rounded-xl p-2">
        {courses.map((course) => (
          <div
            key={course.id}
            className="m-auto flex w-full gap-10 rounded-2xl bg-card-foreground/10 p-3"
          >
            {course.students.length === 0 ? (
              <div className="flex flex-1 items-center justify-start gap-4 self-start">
                <Checkbox disabled id={"name-" + course.id} />
                <div className="text-xl font-bold opacity-50">
                  <label
                    htmlFor={"name-" + course.id}
                    className="leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {course.name}
                  </label>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-start gap-4 self-start">
                <Checkbox id={"name-" + course.id} />
                <div className="text-xl font-bold">
                  <label
                    htmlFor={"name-" + course.id}
                    className="leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {course.name}
                  </label>
                </div>
              </div>
            )}
            <div className="m-auto flex h-full flex-1 items-end justify-end gap-2 self-end">
              {course.students.length === 0 ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TriangleAlert></TriangleAlert>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{course.name} has no students!</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <span></span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
