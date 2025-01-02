import { type NextRequest, NextResponse } from 'next/server';
import { db } from '~/server/db';
import { auth } from '@clerk/nextjs/server';
import { eq, and, or, isNull, inArray } from 'drizzle-orm';
import {
  classes,
  teacher_classes,
  groups,
  students,
  student_groups,
  student_classes,
  reward_items,
  behaviors,
  points,
  absent_dates,
  achievements,
  topics,
  assignments,
  student_assignments,
  expectations,
  student_expectations,
} from '~/server/db/schema';
import type { Achievement, Expectation, Point, PointRecord, RedemptionRecord, StudentExpectation, Topic } from '~/server/db/types';
import { InferModel } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export type ClassData = {
  class_id: string;
  class_name: string;
  class_language: string;
  class_grade: string | null;
  class_year: string | null;
  class_code: string;
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
  topics: Topic[];
  assignments: AssignmentData[];
  expectations: Expectation[];
  student_expectations: StudentExpectation[];
};

export type AssignmentData = {
  id: string;
  user_id: string;
  class_id: string;
  name: string;
  description: string | null;
  data: string | null;
  due_date: string | null;
  topic: string | null;
  working_date: string | null;
  created_date: string;
  updated_date: string;
  students: {
    student_id: string;
    complete: boolean;
    completed_ts: string | null;
  }[];
}

export type StudentData = {
  student_id: string;
  student_name_en: string;
  student_name_first_en: string;
  student_name_last_en: string;
  student_name_alt: string | null;
  student_reading_level: string | null;
  student_grade: string | null;
  student_sex: 'male' | 'female' | null;
  student_number: number | null;
  student_email: string | null;
  enrollment_date: string | null;
  points?: number;
  point_history?: Point[];
  absent_dates?: string[];
  redemption_history: RedemptionRecord[];
};

export type RewardItemData = {
  item_id: string;
  price: number;
  name: string;
  title?: string | null;
  description: string | null;
  icon: string | null;
  class_id: string | null;
  user_id: string;
  type: 'solo' | 'group' | 'class';
  achievements: Achievement[];
  created_date: string;
  updated_date: string;
};

export type BehaviorData = {
  behavior_id: string;
  title?: string | null;
  name: string;
  point_value: number;
  description: string | null;
  icon: string | null;
  color: string | null;
  class_id: string | null;
  user_id: string;
  achievements: Achievement[];
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
      class_code: classes.class_code,
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
      // Fetch groups in the class
      const groupsData = await db
        .select()
        .from(groups)
        .where(eq(groups.class_id, classData.class_id))
        .all();

      // Fetch all students in the class (for allStudentsData)
      const allStudentsDataRaw = await db
        .select({
          student_id: students.student_id,
          student_name_en: students.student_name_en,
          student_name_first_en: students.student_name_first_en,
          student_name_last_en: students.student_name_last_en,
          student_name_alt: students.student_name_alt,
          student_reading_level: students.student_reading_level,
          student_grade: students.student_grade,
          student_sex: students.student_sex,
          student_number: students.student_number,
          student_email: students.student_email,
          enrollment_date: student_classes.enrollment_date,
        })
        .from(student_classes)
        .innerJoin(students, eq(student_classes.student_id, students.student_id))
        .where(eq(student_classes.class_id, classData.class_id))
        .all();

      // Fetch all student IDs in the class
      const studentIds = allStudentsDataRaw.map((student) => student.student_id);

      // Fetch all points for students in the class
      const pointsData = await db
        .select()
        .from(points)
        .where(
          and(eq(points.class_id, classData.class_id), inArray(points.student_id, studentIds))
        )
        .all();

      // Organize points per student
      const pointsByStudent = new Map<string, InferModel<typeof points>[]>();
      pointsData.forEach((point) => {
        const studentId = point.student_id;
        if (!pointsByStudent.has(studentId)) {
          pointsByStudent.set(studentId, []);
        }
        pointsByStudent.get(studentId)!.push(point);
      });

      // Fetch all absent dates for students in the class
      const absentDatesData = await db
        .select()
        .from(absent_dates)
        .where(
          and(eq(absent_dates.class_id, classData.class_id), inArray(absent_dates.student_id, studentIds))
        )
        .all();

      // Organize absent dates per student
      const absentDatesByStudent = new Map<string, string[]>();
      absentDatesData.forEach((absence) => {
        const studentId = absence.student_id;
        const date = absence.date;
        if (!absentDatesByStudent.has(studentId)) {
          absentDatesByStudent.set(studentId, []);
        }
        absentDatesByStudent.get(studentId)!.push(date);
      });

      // Process groups and their students
      const groupsWithStudents = await Promise.all(
        groupsData.map(async (group) => {
          // Fetch students in the group
          const studentsDataRaw = await db
            .select({
              student_id: students.student_id,
              student_name_en: students.student_name_en,
              student_name_first_en: students.student_name_first_en,
              student_name_last_en: students.student_name_last_en,
              student_name_alt: students.student_name_alt,
              student_reading_level: students.student_reading_level,
              student_grade: students.student_grade,
              student_sex: students.student_sex,
              student_number: students.student_number,
              student_email: students.student_email,
              enrollment_date: student_groups.enrollment_date,
            })
            .from(student_groups)
            .innerJoin(students, eq(student_groups.student_id, students.student_id))
            .where(eq(student_groups.group_id, group.group_id))
            .all();

          // Augment each student with points, point_history, absent_dates, redemption_history
          const studentsData = studentsDataRaw.map((student) => {
            const studentId = student.student_id;
            const studentPoints = pointsByStudent.get(studentId) ?? [];

            // Calculate total points
            const totalPoints = studentPoints.reduce(
              (sum, point) => sum + point.number_of_points,
              0
            );

            // Build point history
            const pointHistory: Omit<Point, "updated_date">[] = studentPoints.map((point) => ({
              id: point.id,
              user_id: point.user_id,
              class_id: point.class_id,
              student_id: point.student_id,
              behavior_id: point.behavior_id,
              reward_item_id: point.reward_item_id,
              type: point.type,
              number_of_points: point.number_of_points,
              created_date: point.created_date,
            }));

            // Build redemption history
            const redemptionHistory: RedemptionRecord[] = studentPoints
              .filter((point) => point.type === 'redemption')
              .map((point) => ({
                item_id: point.reward_item_id!,
                date: point.created_date,
                quantity: point.number_of_points,
              }));

            // Get absent dates
            const absentDates = absentDatesByStudent.get(studentId) ?? [];

            return {
              ...student,
              points: totalPoints,
              point_history: pointHistory,
              absent_dates: absentDates,
              redemption_history: redemptionHistory,
            };
          });

          return {
            group_id: group.group_id,
            group_name: group.group_name,
            students: studentsData,
          };
        })
      );

      // Augment all students data
      const allStudentsData = allStudentsDataRaw.map((student) => {
        const studentId = student.student_id;
        const studentPoints = pointsByStudent.get(studentId) ?? [];

        // Calculate total points
        const totalPoints = studentPoints.reduce(
          (sum, point) => sum + point.number_of_points,
          0
        );

        // Build point history
        const pointHistory: Omit<Point, "updated_date">[] = studentPoints.map((point) => ({
          id: point.id,
          user_id: point.user_id,
          class_id: point.class_id,
          student_id: point.student_id,
          behavior_id: point.behavior_id,
          reward_item_id: point.reward_item_id,
          type: point.type,
          number_of_points: point.number_of_points,
          created_date: point.created_date,
        }));

        // Build redemption history
        const redemptionHistory: RedemptionRecord[] = studentPoints
          .filter((point) => point.type === 'redemption')
          .map((point) => ({
            item_id: point.reward_item_id!,
            date: point.created_date,
            quantity: point.number_of_points,
          }));

        // Get absent dates
        const absentDates = absentDatesByStudent.get(studentId) ?? [];        

        return {
          ...student,
          points: totalPoints,
          point_history: pointHistory,
          absent_dates: absentDates,
          redemption_history: redemptionHistory,
        };
      });

      // Fetch reward items associated with the class
      const rewardItemsData = await db
        .select({
          item_id: reward_items.item_id,
          price: reward_items.price,
          name: reward_items.name,
          title: reward_items.title,
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
          eq(reward_items.class_id, classData.class_id)
        )
        .all();

      // Fetch behaviors associated with the class
      const behaviorsData = await db
        .select({
          behavior_id: behaviors.behavior_id,
          name: behaviors.name,
          title: behaviors.title,
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
          eq(behaviors.class_id, classData.class_id)
        )
        .all();

      // Fetch achievements associated with the class
      const achievementsData = await db
        .select()
        .from(achievements)
        .where(
          eq(achievements.class_id, classData.class_id)
        )
        .all();

      const topicsData = await db
        .select()
        .from(topics)
        .where(
          eq(topics.class_id, classData.class_id)
        )
        .all();

      const assignmentsData = await db
        .select()
        .from(assignments)
        .where(
          eq(assignments.class_id, classData.class_id)
        )
        .all();

      const studentAssignmentsData = await db
        .select()
        .from(student_assignments)
        .where(
          eq(student_assignments.class_id, classData.class_id)
        )
        .all();

      const expectationsData = await db
        .select()
        .from(expectations)
        .where(
          eq(expectations.class_id, classData.class_id)
        )
        .all();

      const studentExpecationsData = await db
        .select()
        .from(student_expectations)
        .where(
          eq(student_expectations.class_id, classData.class_id)
        )
        .all();

      // Organize achievements by behavior_id and reward_item_id
      const achievementsByBehavior = new Map<string, Achievement[]>();
      const achievementsByRewardItem = new Map<string, Achievement[]>();

      achievementsData.forEach((ach) => {
        if (ach.behavior_id) {
          if (!achievementsByBehavior.has(ach.behavior_id)) {
            achievementsByBehavior.set(ach.behavior_id, []);
          }
          achievementsByBehavior.get(ach.behavior_id)!.push(ach);
        }

        if (ach.reward_item_id) {
          if (!achievementsByRewardItem.has(ach.reward_item_id)) {
            achievementsByRewardItem.set(ach.reward_item_id, []);
          }
          achievementsByRewardItem.get(ach.reward_item_id)!.push(ach);
        }
      });

      // Augment behaviors with their respective achievements
      const behaviorsWithAchievements = behaviorsData.map((behavior) => ({
        ...behavior,
        achievements: achievementsByBehavior.get(behavior.behavior_id) ?? [],
      }));

      // Augment reward items with their respective achievements
      const rewardItemsWithAchievements = rewardItemsData.map((item) => ({
        ...item,
        achievements: achievementsByRewardItem.get(item.item_id) ?? [],
      }));

      // Create a map of assignment_id -> students
      const assignmentStudentsMap = new Map<string, { student_id: string; complete: boolean; completed_ts: string | null }[]>();

      for (const sa of studentAssignmentsData) {
        if (!assignmentStudentsMap.has(sa.assignment_id)) {
          assignmentStudentsMap.set(sa.assignment_id, []);
        }
        assignmentStudentsMap.get(sa.assignment_id)!.push({
          student_id: sa.student_id,
          complete: !!sa.complete,
          completed_ts: sa.completed_ts
        });
      }

      // Add students array to each assignment
      const assignmentsWithStudents = assignmentsData.map((assignment) => ({
        ...assignment,
        students: assignmentStudentsMap.get(assignment.id) ?? []
      }));

      return {
        ...classData,
        groups: groupsWithStudents,
        students: allStudentsData,
        reward_items: rewardItemsWithAchievements,
        behaviors: behaviorsWithAchievements,
        topics: topicsData,
        assignments: assignmentsWithStudents,
        expectations: expectationsData,
        student_expectations: studentExpecationsData
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
