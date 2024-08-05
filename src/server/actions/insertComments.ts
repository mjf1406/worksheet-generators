"use server"

import { db } from "~/server/db/index";
import { 
    subject_achievement_comments as subjectAchievementCommentsTable
} from "~/server/db/schema";
import type { CommentsDb } from "../db/types";
import { randomUUID } from "crypto";

function generateUuidWithPrefix(prefix: string){
    return `${prefix}${randomUUID()}`
}

export type Data = {
    example: object;
    listening: { l1: string, l2: string, l3: string, l4: string, l5: string};
    mathematics: { l1: string, l2: string, l3: string, l4: string, l5: string};
    reading: { l1: string, l2: string, l3: string, l4: string, l5: string};
    science: { l1: string, l2: string, l3: string, l4: string, l5: string};
    social_studies: { l1: string, l2: string, l3: string, l4: string, l5: string};
    speaking: { l1: string, l2: string, l3: string, l4: string, l5: string};
    use_of_english: { l1: string, l2: string, l3: string, l4: string, l5: string};
    writing: { l1: string, l2: string, l3: string, l4: string, l5: string};
}

export default async function insertComments(data: Data, semester: string, year: string, classGrade: string) {
    const commentData: CommentsDb = {
        id: generateUuidWithPrefix('subjectComments_'),
        grade: classGrade,
        semester: semester,
        year: year,
        listening: data.listening,
        mathematics: data.mathematics,
        reading: data.reading,
        science: data.science,
        social_studies: data.social_studies,
        speaking: data.speaking,
        use_of_english: data.use_of_english,
        writing: data.writing,
    }
    await db.insert(subjectAchievementCommentsTable).values(commentData)
}