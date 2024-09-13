"use client";

import type { TeacherCourse } from "~/server/db/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface ClassSelectProps {
  onClassSelect: (classId: string) => void;
  classes: TeacherCourse[];
}

export default function ClassSelect({
  onClassSelect,
  classes,
}: ClassSelectProps) {
  return (
    <div className="flex w-full items-center gap-2">
      <Select onValueChange={onClassSelect}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Class" />
        </SelectTrigger>
        <SelectContent>
          {classes.map((course) => (
            <SelectItem key={course.class_id} value={course.class_id}>
              {course.class_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
