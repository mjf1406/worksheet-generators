import { queryOptions } from '@tanstack/react-query'
import type { Assigner, RandomEvent, TeacherCourse } from '~/server/db/types';

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

export const randomEventsOptions = queryOptions<RandomEvent[]>({
  queryKey: ["random-events"],
  queryFn: async () => {
      const response = await fetch("/api/getRandomEvents");
      return response.json();
    },
})