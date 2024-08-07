"use client";

import { useEffect, useState } from "react";
import type { TeacherCourse } from "~/server/db/types";
import { fetchClassroomData } from "./ClassList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";

interface ClassSelectProps {
  onClassSelect: (classId: string) => void;
}

export default function ClassSelect({ onClassSelect }: ClassSelectProps) {
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void fetchClassroomData()
      .then((data) => {
        setCourses(data);
        setIsLoading(false);
      })
      .catch((error) => {
        const err = error as Error;
        console.error("failed to fetch classes data", err);
        throw new Error("failed to fetch classes", err);
      });
  }, []);

  return (
    <div className="flex w-full items-center gap-2">
      <Select onValueChange={onClassSelect}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={isLoading ? "Loading..." : "Class"} />
        </SelectTrigger>
        <SelectContent>
          {courses.map((course) => (
            <SelectItem key={course.class_id} value={course.class_id}>
              {course.class_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
