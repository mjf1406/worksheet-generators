"use server"

import { db } from "~/server/db/index";
import { classes as classesTable, 
    teacher_classes as teacherClassesTable, 
    students as studentTable, 
    student_classes as studentClassesTable,
    users as usersTable } from "../db/schema";
import { sql, eq } from "drizzle-orm";
import { type Course, type Teacher, type Student, type StudentField } from "../db/types";
import { isTeacherInClass } from "./isTeacherInClass";

export type DataButt = {
    class: {
        teacher_classes: {
            assigned_date: string | undefined,
            assignment_id: string | undefined,
            role: string | undefined,
            user_id: string | undefined,
            class_id: string | undefined,
            class_name: string | undefined,
            class_language: string | undefined,
            created_date: string | undefined,
            updated_date: string | undefined,
            class_grade: string | undefined,
            complete: {
                s1: boolean,
                s2: boolean
            };
        },
        classes: {
            assigned_date: string | undefined,
            assignment_id: string | undefined,
            role: string | undefined,
            user_id: string | undefined,
            class_id: string | undefined,
            class_name: string | undefined,
            class_language: string | undefined,
            class_year: string | undefined,
            created_date: string | undefined,
            updated_date: string | undefined,
            class_grade: string | undefined,
            complete: {
                s1: boolean,
                s2: boolean
            };
        },
        users: {
            user_name: string | undefined,
            user_email: string | undefined,
            joined_date: string | undefined,
            updated_date: string | undefined,
        }
    }[],
    students: {
        student_classes: {
            enrollment_date: string | undefined,
            enrollment_id: string | undefined,
            student_id: string
        },
        students: {
            student_name_first_en: string | undefined,
            student_name_last_en: string | undefined,
            student_name_alt: string | undefined,
            student_email: string | undefined,
            joined_date: string | undefined,
            updated_date: string | undefined,
            student_sex: "male" | "female",
            student_number: number | undefined,
            student_grade: string | undefined;
            student_reading_level: string | undefined;
        }
    }[],
}

type data = {
    class: [];
    students: [];
};
  
const getClassById = async (classId: string, userId: string | undefined | null) => {
    if (!userId) throw new Error("User not authenticated")

    const isTeacherInClassBool: boolean = await isTeacherInClass(userId, classId)
    if (!isTeacherInClassBool) throw new Error("Unauthorized! You are not a teacher in this class.")
        
    try {
        const classData = await db
            .select()
            .from(classesTable)
            .innerJoin(teacherClassesTable, eq(classesTable.class_id, teacherClassesTable.class_id))
            .innerJoin(usersTable, eq(teacherClassesTable.user_id, usersTable.user_id))
            .where(eq(teacherClassesTable.class_id, classId))
        const students = await db
            .select()
            .from(studentTable)
            .innerJoin(studentClassesTable, eq(studentTable.student_id, studentClassesTable.student_id))
            .where(sql`${studentClassesTable.class_id} = ${classId}`)
            .orderBy(studentTable.student_number)

        const data: DataButt = { class: classData, students: students } as data
        return await databaseClassToCourseMap(data)
    } catch (error) {
        console.error('Error fetching class:', error);
        throw new Error('Failed to fetch class.');
    }
}

async function databaseClassToCourseMap(data: DataButt): Promise<Course | undefined> {
    if (!data) return undefined
    const teachers: Teacher[] = [];

    for (const teacher of data.class) {
        const teacherData = teacher.teacher_classes;

        const teach: Teacher = {
            assigned_date: teacherData.assigned_date,
            assignment_id: teacherData.assignment_id,
            role: teacherData.role,
            user_id: teacherData.user_id,
            user_name: teacher.users.user_name,
            user_email: teacher.users.user_email,
            joined_date: teacher.users.joined_date,
            updated_date: teacher.users.updated_date,
        }
        teachers.push(teach);
    }
  
    const students: Student[] = [];

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let index = 0; index < data.students.length; index++) {
        const student = data.students[index];

        students.push({
            enrollment_date: student?.student_classes.enrollment_date,
            enrollment_id: student?.student_classes.enrollment_id,
            student_id: student?.student_classes.student_id,
            student_name_first_en: student?.students.student_name_first_en,
            student_name_last_en: student?.students.student_name_last_en,
            student_name_alt: student?.students.student_name_alt,
            student_grade: student?.students.student_grade,
            student_reading_level: student?.students.student_reading_level,
            student_email: student?.students.student_email,
            joined_date: student?.students.joined_date,
            updated_date: student?.students.updated_date,
            student_sex: student?.students.student_sex,
            student_number: student?.students.student_number,
            student_name_en: undefined
        })
    }
  
    const classData: Course = {
        class_id: data?.class[0]?.classes.class_id,
        class_name: data?.class[0]?.classes.class_name,
        class_language: data?.class[0]?.classes.class_language,
        class_year: data?.class[0]?.classes.class_year,
        class_grade: data?.class[0]?.classes.class_grade,
        created_date: data?.class[0]?.classes.created_date,
        updated_date: data?.class[0]?.classes.updated_date,
        complete: data?.class[0]?.classes.complete ? data?.class[0]?.classes.complete : { s1: false, s2: false },
        teachers: teachers,
        students: students,
    };
    return classData;
}

export { getClassById, databaseClassToCourseMap }

