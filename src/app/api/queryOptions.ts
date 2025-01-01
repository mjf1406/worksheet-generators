import { queryOptions } from '@tanstack/react-query'
import type { Assigner, Behavior, RandomEvent, RewardItem, TeacherCourse } from '~/server/db/types';
import type { GoogleClassroom } from './GoogleClasses/route';

export const GoogleClassOptions = queryOptions<GoogleClassroom[]>({
  queryKey: ["google-classes"],
  queryFn: async () => {
    const response = await fetch("/api/GoogleClasses");
    return response.json()
  }
})

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

export const behaviorsOptions = queryOptions<Behavior[]>({
  queryKey: ["behaviors"],
  queryFn: async () => {
    const response = await fetch("/api/getBehaviors");
    return response.json();
  },
});

export const rewardItemsOptions = queryOptions<RewardItem[]>({
  queryKey: ["reward-items"],
  queryFn: async () => {
    const response = await fetch("/api/getRewardItems");
    return response.json();
  },
});