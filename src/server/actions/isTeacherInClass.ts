"use server";

import { db } from "~/server/db/index";
import { users as usersTable, teacher_classes as teacherClassesTable } from "../db/schema";
import { eq, and } from "drizzle-orm";

const isTeacherInClass = async (userId: string | null, classId: string | null) => {
    if (!userId) throw new Error("User not authenticated")
    if (!classId) throw new Error("Invalid class id") 

    try {
        const studentData = await db
            .select()
            .from(usersTable)
            .innerJoin(teacherClassesTable, eq(usersTable.user_id, teacherClassesTable.user_id))
            .where(
                and(
                    eq(usersTable.user_id, userId),
                    eq(teacherClassesTable.class_id, classId)
                )
            );            
        return (studentData.length > 0) ? true : false as boolean
    } catch (error) {
        console.error('Error fetching Reparper student:', error);
        throw new Error('Failed to fetch Reparper student.');
    }
};

export { isTeacherInClass };