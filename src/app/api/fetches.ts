import type { TeacherCourse } from "~/server/db/types";

export default async function fetchClassesGroupsStudents() {
    const res = await fetch("/api/getClassesGroupsStudents");
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    return res.json();
  }

  export async function fetchClassroomData(): Promise<TeacherCourse[]> {
    try {
      const response = await fetch("/api/getClasses");
      if (!response.ok) {
        throw new Error("Failed to fetch classes data");
      }
      const text: string = await response.text(); // Make this operation await so it completes here
      const data: TeacherCourse[] = JSON.parse(text) as TeacherCourse[];
      return data;
    } catch (err) {
      const error = err as Error;
      console.error("failed to parse course", error);
      throw new Error("failed to parse course");
    }
  }