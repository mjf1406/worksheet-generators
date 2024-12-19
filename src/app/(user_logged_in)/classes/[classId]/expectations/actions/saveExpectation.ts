"use server";

import { z } from "zod";
import { db } from "~/server/db"; // adjust import as needed
import { student_expectations } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

// Define Zod schema for incoming data
const ExpectationSchema = z.object({
  class_id: z.string(),
  student_id: z.string(),
  expectation_id: z.string(),
  value: z.string().optional(),
  number: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.number().optional()
  ),
}).refine(
  (data) => data.value !== undefined || data.number !== undefined,
  "Either value or number must be provided"
);

interface SaveExpectationInput {
  class_id: string;
  student_id: string;
  expectation_id: string;
  value?: string;
  number?: number;
}

// This is a server action
export async function saveExpectation(input: SaveExpectationInput) {
  // Validate input
  const parsed = ExpectationSchema.parse(input);

  const { userId } = auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  // Check if record already exists
  const existing = await db
    .select()
    .from(student_expectations)
    .where(
      and(
        eq(student_expectations.user_id, userId),
        eq(student_expectations.class_id, parsed.class_id),
        eq(student_expectations.student_id, parsed.student_id),
        eq(student_expectations.expectation_id, parsed.expectation_id)
      )
    )
    .get(); // or `.all()` if not using `get()` syntax

  const currentTimestamp = new Date().toISOString();

  if (existing) {
    // Update record
    await db
      .update(student_expectations)
      .set({
        value: parsed.value ?? null,
        number: parsed.number ?? null,
        updated_date: currentTimestamp,
      })
      .where(
        and(
          eq(student_expectations.user_id, userId),
          eq(student_expectations.class_id, parsed.class_id),
          eq(student_expectations.student_id, parsed.student_id),
          eq(student_expectations.expectation_id, parsed.expectation_id)
        )
      )
      .run();
  } else {
    // Insert new record
    await db
      .insert(student_expectations)
      .values({
        id: crypto.randomUUID(),
        expectation_id: parsed.expectation_id,
        student_id: parsed.student_id,
        user_id: userId,
        class_id: parsed.class_id,
        value: parsed.value ?? null,
        number: parsed.number ?? null,
      })
      .run();
  }

  return { success: true };
}
