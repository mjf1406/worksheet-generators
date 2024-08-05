"use server"

import { db } from "~/server/db/index";
import { 
    student_classes as studentClassesTable,
} from "~/server/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export default async function removeStudentFromClass(studentId: string | undefined, classId: string | undefined) {
    if (!studentId || !classId) return
    try {
        const { userId } = auth()
        if (!userId) {
            console.error("User not authenticated:")
            throw new Error("User not authenticated:")
        }
        await db.delete(studentClassesTable)
            .where(
                and(
                    eq(studentClassesTable.student_id, studentId), 
                    eq(studentClassesTable.class_id, classId)
                )
            )
    } catch (error) {
        const err = error as Error
        console.error("Failed to delete class:", err)
        throw new Error("Failed to delete class:", err)
    }
    revalidatePath(`/classes/${classId}`);
}