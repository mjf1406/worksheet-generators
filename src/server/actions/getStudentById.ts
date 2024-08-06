"use server";

import { db } from "~/server/db/index";
import { students as studentsTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { isTeacherInClass } from "./isTeacherInClass";

const getStudent = async (studentId: string | null, classId: string | null, userId: string | undefined) => {
    console.log("🚀 ~ getStudent ~ userId:", userId)
    if (!userId) throw new Error("getStudentById: User not authenticated")
    if (!studentId) {
        console.error('Missing student id!');
        throw new Error('Missing student id!');
    }

    const isTeacherInClassBool: boolean = await isTeacherInClass(userId, classId)
    if (!isTeacherInClassBool) throw new Error("Unauthorized! You are not a teacher in this class.")

    try {
        const studentData = await db
            .select()
            .from(studentsTable)
            .where(eq(studentsTable.student_id, studentId));
        return studentData;
    } catch (error) {
        console.error('Error fetching Reparper student:', error);
        throw new Error('Failed to fetch Reparper student.');
    }
};

export { getStudent };