"use server"

import { db } from "~/server/db/index";
import { 
    users as usersTable, 
} from "~/server/db/schema";
import { type UserDb } from "../db/types";
import { clerkClient } from "@clerk/nextjs/server";

export default async function insertUser(userId: string) {
    try {
        const user = await clerkClient.users.getUser(userId);
        const userName = `${user.firstName} ${user.lastName}`
        const userEmail = user.emailAddresses.find(i => i.id === user.primaryEmailAddressId)?.emailAddress
    
        const teacherData: UserDb = {
            user_id: userId,
            user_name: userName,
            user_email: String(userEmail),
            user_role: 'teacher',
            joined_date: undefined,
            updated_date: undefined,
        }
        await db.insert(usersTable).values(teacherData)
    } catch (err) {
        const error = err as Error;
        console.error("Failed to add the teacher.", error)
        throw new Error("Failed to add the teacher.", error)
    }
}