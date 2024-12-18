'use server'

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { generateUuidWithPrefix } from "~/server/db/helperFunction";
import { expectations } from "~/server/db/schema";
import type { Expectation } from "~/server/db/types";

// Zod schema for input validation
const createExpectationSchema = z.object({
  classId: z.string().min(1, "Class ID is required"),
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z.string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters")
    .nullable(),
});

type CreateExpectationInput = z.infer<typeof createExpectationSchema>;

export async function createExpectation(input: CreateExpectationInput) {
    const { userId } = auth();
    if (!userId) throw new Error("Unauthorized");

    const validatedData = createExpectationSchema.safeParse(input);
    if (!validatedData.success) {
        const errorMessage = validatedData.error.errors[0]?.message ?? "Invalid input";
        throw new Error(errorMessage);
    }

    try {
        const { classId, name, description } = validatedData.data;
        
        const newExpectation = {
            id: generateUuidWithPrefix("expectation_"),
            user_id: userId,
            class_id: classId,
            name: name,
            description: description,
        } satisfies Omit<Expectation, "created_date" | "updated_date">;

        await db.insert(expectations).values(newExpectation);
        
        return { success: true };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('Failed to create expectation');
    }
}