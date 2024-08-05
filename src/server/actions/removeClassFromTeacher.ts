"use server"

import { db } from "~/server/db/index";
import { 
    classes as classesTable, 
    teacher_classes as teacherClassesTable,
    student_classes as studentClassesTable,
} from "~/server/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
// import deleteStudentsByClassId from "./deleteStudentsByClassId";

export default async function removeClassFromTeacher(classId: string) {
    try {
        const { userId } = auth()
        if (!userId) {
            console.error("User not authenticated:")
            throw new Error("User not authenticated:")
        }
        await db.delete(studentClassesTable).where(eq(studentClassesTable.class_id, classId))
        await db.delete(teacherClassesTable).where(eq(teacherClassesTable.class_id, classId))
        await db.delete(classesTable).where(eq(classesTable.class_id, classId))
        // await deleteStudentsByClassId(classId) // delete students if they are in no other classes
    } catch (error) {
        const err = error as Error
        console.error("Failed to delete class:", err)
        throw new Error("Failed to delete class:", err)
    }
    revalidatePath("/classes");
}