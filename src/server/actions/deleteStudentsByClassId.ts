"use server"

import { db } from "~/server/db/index";
import { 
    students as studentsTable, 
    student_classes as studentClassesTable,
} from "~/server/db/schema";
import { eq, not, and } from "drizzle-orm";

export default async function deleteStudentsByClassId(classId: string) {
    try {
        const allStudents = await db
            .select()
            .from(studentClassesTable)
            .innerJoin(studentsTable, eq(studentsTable.student_id, studentClassesTable.student_id))
            .where(eq(studentClassesTable.class_id, classId));

        for (const student of allStudents) {
            const studentId = student.students.student_id
            const otherClasses = await db
                .select()
                .from(studentClassesTable)
                .where(
                    and(
                        eq(studentClassesTable.student_id, studentId), 
                        not(eq(studentClassesTable.class_id, classId))
                    )
                )
            if (otherClasses.length === 0) {
                // This student is in no other classes, can delete
                console.log("🚀 ~ deleteClass ~ studentId:", "Deleting student:", studentId)
                await db.delete(studentsTable).where(eq(studentsTable.student_id, studentId));
            }
        }
    } catch (error) {
        const err = error as Error
        console.error("Failed to delete class:", err)
        throw new Error("Failed to delete class:", err)
    }
}