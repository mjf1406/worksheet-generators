import { type NextRequest, NextResponse } from 'next/server';
import { db } from '~/server/db';
import { auth } from '@clerk/nextjs/server';
import { eq, and, or, isNull } from 'drizzle-orm';
import {
  classes,
  teacher_classes,
  groups,
  students,
  student_groups,
  student_classes,
  reward_items,
  behaviors,
} from '~/server/db/schema';
import type { PointRecord, RedemptionRecord } from '~/server/db/types';

export const dynamic = 'force-dynamic';

export type ClassData = {
  class_id: string;
  class_name: string;
  class_language: string;
  class_grade: string | null;
  class_year: string | null;
  created_date: string;
  updated_date: string;
  complete: {
    s1: boolean;
    s2: boolean;
  } | null;
  assigned_date: string | null;
  role: string | null;
  groups: {
    group_id: string;
    group_name: string;
    students: StudentData[];
  }[];
  students: StudentData[];
  reward_items: RewardItemData[];
  behaviors: BehaviorData[];
};

export type StudentData = {
  student_id: string;
  student_name_en: string;
  student_name_alt: string | null;
  student_reading_level: string | null;
  student_grade: string | null;
  student_sex: 'male' | 'female' | null;
  student_number: number | null;
  student_email: string | null;
  enrollment_date: string | null;
  points?: number;
  point_history?: PointRecord[];
  absent_dates?: string[];
  redemption_history: RedemptionRecord[],
};

export type RewardItemData = {
  item_id: string;
  price: number;
  name: string;
  description: string | null;
  icon: string | null;
  class_id: string | null;
  user_id: string;
  type: 'solo' | 'group' | 'class';
  created_date: string;
  updated_date: string;
};

export type BehaviorData = {
  behavior_id: string;
  name: string;
  point_value: number;
  description: string | null;
  icon: string | null;
  class_id: string | null;
  user_id: string;
  created_date: string;
  updated_date: string;
};

async function fetchClassesWithDetails(userId: string): Promise<ClassData[]> {
  const classesData = await db
    .select({
      class_id: classes.class_id,
      class_name: classes.class_name,
      class_language: classes.class_language,
      class_grade: classes.class_grade,
      class_year: classes.class_year,
      created_date: classes.created_date,
      updated_date: classes.updated_date,
      complete: classes.complete,
      assigned_date: teacher_classes.assigned_date,
      role: teacher_classes.role,
    })
    .from(teacher_classes)
    .innerJoin(classes, eq(teacher_classes.class_id, classes.class_id))
    .where(eq(teacher_classes.user_id, userId))
    .all();

  const classesWithDetails: ClassData[] = await Promise.all(
    classesData.map(async (classData) => {
      const groupsData = await db
        .select()
        .from(groups)
        .where(eq(groups.class_id, classData.class_id))
        .all();

      const groupsWithStudents = await Promise.all(
        groupsData.map(async (group) => {
          const studentsData = await db
            .select({
              student_id: students.student_id,
              student_name_en: students.student_name_en,
              student_name_alt: students.student_name_alt,
              student_reading_level: students.student_reading_level,
              student_grade: students.student_grade,
              student_sex: students.student_sex,
              student_number: students.student_number,
              student_email: students.student_email,
              enrollment_date: student_groups.enrollment_date,
              points: student_classes.points,
              point_history: student_classes.point_history,
              absent_dates: student_classes.absent_dates,
              redemption_history: student_classes.redemption_history,
            })
            .from(student_groups)
            .innerJoin(students, eq(student_groups.student_id, students.student_id))
            .innerJoin(student_classes, eq(student_classes.student_id, students.student_id))
            .where(eq(student_groups.group_id, group.group_id))
            .all();

          return {
            group_id: group.group_id,
            group_name: group.group_name,
            students: studentsData,
          };
        })
      );

      const allStudentsData = await db
        .select({
          student_id: students.student_id,
          student_name_en: students.student_name_en,
          student_name_alt: students.student_name_alt,
          student_reading_level: students.student_reading_level,
          student_grade: students.student_grade,
          student_sex: students.student_sex,
          student_number: students.student_number,
          student_email: students.student_email,
          enrollment_date: student_classes.enrollment_date,
          points: student_classes.points,
          point_history: student_classes.point_history,
          absent_dates: student_classes.absent_dates,
          redemption_history: student_classes.redemption_history,
        })
        .from(student_classes)
        .innerJoin(students, eq(student_classes.student_id, students.student_id))
        .where(eq(student_classes.class_id, classData.class_id))
        .all();

      // Fetch reward items associated with the class and user
      const rewardItemsData = await db
        .select({
          item_id: reward_items.item_id,
          price: reward_items.price,
          name: reward_items.name,
          description: reward_items.description,
          icon: reward_items.icon,
          class_id: reward_items.class_id,
          user_id: reward_items.user_id,
          type: reward_items.type,
          created_date: reward_items.created_date,
          updated_date: reward_items.updated_date,
        })
        .from(reward_items)
        .where(
          and(
            eq(reward_items.user_id, userId),
            or(eq(reward_items.class_id, classData.class_id), isNull(reward_items.class_id))
          )
        )
        .all();

      // Fetch behaviors associated with the class and user
      const behaviorsData = await db
        .select({
          behavior_id: behaviors.behavior_id,
          name: behaviors.name,
          point_value: behaviors.point_value,
          description: behaviors.description,
          icon: behaviors.icon,
          color: behaviors.color,
          class_id: behaviors.class_id,
          user_id: behaviors.user_id,
          created_date: behaviors.created_date,
          updated_date: behaviors.updated_date,
        })
        .from(behaviors)
        .where(
          and(
            eq(behaviors.user_id, userId),
            or(eq(behaviors.class_id, classData.class_id), isNull(behaviors.class_id))
          )
        )
        .all();

      return {
        ...classData,
        groups: groupsWithStudents,
        students: allStudentsData,
        reward_items: rewardItemsData,
        behaviors: behaviorsData,
      } as ClassData;
    })
  );

  return classesWithDetails;
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      throw new Error('User ID is null');
    }

    const classesData = await fetchClassesWithDetails(userId);

    return new NextResponse(JSON.stringify(classesData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Unable to fetch classes due to an internal error.' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
