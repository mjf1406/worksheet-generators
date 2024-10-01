import { db } from "~/server/db/index";
import { classes as classesTable, teacher_classes as teacherClassesTable } from "~/server/db/schema";
import { sql, eq } from "drizzle-orm";

const getClasses = async (userId: string) => {
    try {
        const allClasses = await db
            .select()
            .from(classesTable)
            .innerJoin(teacherClassesTable, eq(classesTable.class_id, teacherClassesTable.class_id))
            .where(sql`${teacherClassesTable.user_id} = ${userId}`);
        return allClasses;
    } catch (error) {
        console.error('Error fetching classes:', error);
        throw new Error('Failed to fetch classes.');
    }
};

  
export { getClasses };