import { queryOptions } from '@tanstack/react-query'
import type { Assigner, TeacherCourse } from '~/server/db/types';

export const assignerOptions = queryOptions<Assigner[]>({
    queryKey: ["assigners"],
    queryFn: async () => {
        const response = await fetch("/api/getAssigners");
        return response.json();
      },
})

export const classesOptions = queryOptions<TeacherCourse[]>({
    queryKey: ["classes"],
    queryFn: async () => {
        const response = await fetch("/api/getClassesGroupsStudents");
        return response.json();
      },
})