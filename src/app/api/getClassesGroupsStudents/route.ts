import { type NextRequest, NextResponse } from 'next/server';
import { db } from '~/server/db'; // Adjust this path to where your database instance is exported
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { classes, teacher_classes, groups, students, student_groups, student_classes } from '~/server/db/schema'; // Adjust this path to where your schema is defined
import { PointRecord } from '~/server/db/types';

export const dynamic = 'force-dynamic'

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
};

export type StudentData = {
    student_id: string;
    student_name_en: string;
    student_name_alt: string | null;
    student_reading_level: string | null;
    student_grade: string | null;
    student_sex: "male" | "female" | null;
    student_number: number | null;
    student_email: string | null;
    enrollment_date: string | null;
    points?: number;
    point_history?: PointRecord[];
    absent_dates?: string[];
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
              })
              .from(student_groups)
              .innerJoin(students, eq(student_groups.student_id, students.student_id))
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
            absent_dates: student_classes.absent_dates
          })
          .from(student_classes)
          .innerJoin(students, eq(student_classes.student_id, students.student_id))
          .where(eq(student_classes.class_id, classData.class_id))
          .all();
  
        return {
          ...classData,
          groups: groupsWithStudents,
          students: allStudentsData,
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
    return new NextResponse(JSON.stringify({ message: 'Unable to fetch classes due to an internal error.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}