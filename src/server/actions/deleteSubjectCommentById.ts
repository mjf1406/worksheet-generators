"use server"

import { db } from "~/server/db/index";
import { subject_achievement_comments as subjectAchievementCommentsTable } from "../db/schema";
import { eq } from "drizzle-orm";

const deleteSubjectCommentById = async (
    userId: string | null | undefined, 
    id: string,
) => { 
    if ( !userId ) throw new Error("User not authenticated")  
    if ( !id ) throw new Error('Missing id')
    
    try {
        await db
            .delete(subjectAchievementCommentsTable)
                .where(
                    eq(subjectAchievementCommentsTable.id, id)
                )
    } catch (error) {
        console.error('Error deleteing comments:', error);
        throw new Error('Failed to delete comments.');
    }
};

export { deleteSubjectCommentById };