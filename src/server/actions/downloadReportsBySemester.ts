"use server"

import { db } from "~/server/db/index";
import { 
    students as studentTable, 
    student_classes as studentClassesTable,
    student_fields as studentFieldTable 
} from "../db/schema";
import { sql, eq } from "drizzle-orm";
import { isTeacherInClass } from "./isTeacherInClass";
import { auth } from "@clerk/nextjs/server";
import type { PDF } from "~/components/classes/ClassList";
import type { StudentField } from "../db/types";

const downloadReportsBySemester = async (classId: string, semester: string) => {
    const { userId } = auth();
    if (!userId) throw new Error("User not authenticated")
    if (!classId || !semester) throw new Error("Missing class id and/or semester")

    const isTeacherInClassBool: boolean = await isTeacherInClass(userId, classId)
    if (!isTeacherInClassBool) throw new Error("Unauthorized! You are not a teacher in this class.")
        
    try {
        const students = await db
            .select()
            .from(studentTable)
            .innerJoin(studentClassesTable, eq(studentTable.student_id, studentClassesTable.student_id))
            .where(sql`${studentClassesTable.class_id} = ${classId}`)
            .orderBy(studentTable.student_number)
        const studentFields = await db
            .select()
            .from(studentFieldTable)
            .innerJoin(studentClassesTable, eq(studentFieldTable.student_id, studentClassesTable.student_id))
            .where(sql`${studentClassesTable.class_id} = ${classId}`)

        const dataFemale: PDF[] = []
        const dataMale: PDF[] = []

        for (const student of students) {
            const stud = student.students
            const studentName = stud.student_name_en
            const studentId = stud.student_id
            const studentNumber = stud.student_number
            const studentSex = stud.student_sex
            const fields = studentFields.find(i => i.student_fields.student_id === studentId)?.student_fields as StudentField
            if (!fields) continue
            if (studentSex === 'f') dataFemale.push({
                student_name: studentName,
                student_number: String(studentNumber),
                student_fields: fields
            })
            if (studentSex === 'm') dataMale.push({
                student_name: studentName,
                student_number: String(studentNumber),
                student_fields: fields
            })
        }

        return { males: dataMale, females: dataFemale }
    } catch (error) {
        console.error('Error fetching class:', error);
        throw new Error('Failed to fetch class.');
    }
}

export { downloadReportsBySemester }