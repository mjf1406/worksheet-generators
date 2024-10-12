// hooks/useData.ts
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import type { UserDb, CommentsDb, Course, Group, Teacher, TeacherCourse, Student, StudentField, Assigner } from "~/server/db/types";

// Fetch function
const fetchData = async (endpoint: string) => {
  const response = await fetch(`/api/${endpoint}`);
  if (!response.ok) {
    throw new Error(`Error fetching ${endpoint}`);
  }
  return response.json();
};

// Hook factory
const createHook = <T>(queryKey: string) => {
  return (initialData?: T[]) => {
    const queryClient = useQueryClient();

    const query = useSuspenseQuery<T[], Error>({
      queryKey: [queryKey],
      queryFn: () => fetchData(queryKey),
      initialData: initialData,
      staleTime: 60000, // Consider data fresh for 1 minute
    });

    const refetch = () => {
      return queryClient.invalidateQueries({ queryKey: [queryKey] });
    };

    const prefetch = () => {
      return queryClient.prefetchQuery({
        queryKey: [queryKey],
        queryFn: () => fetchData(queryKey)
      });
    };

    return { ...query, refetch, prefetch };
  };
};

// Hooks for each type
export const useUsers = createHook<UserDb>('users');
export const useComments = createHook<CommentsDb>('comments');
export const useCourses = createHook<Course>('courses');
export const useGroups = createHook<Group>('groups');
export const useTeachers = createHook<Teacher>('teachers');
export const useTeacherCourses = createHook<TeacherCourse>('teacher-courses');
export const useStudents = createHook<Student>('students');
export const useStudentFields = createHook<StudentField>('student-fields');
export const useAssigners = createHook<Assigner>('assigners');

import { useEffect, useState } from "react";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

export default useIsMobile;
