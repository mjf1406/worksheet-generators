"use server";

import { z } from "zod";
import { db } from "~/server/db";
import { student_assignments } from "~/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";

// Zod schema for updating a student assignment
const updateStudentAssignmentSchema = z.object({
  classId: z.string(),
  studentId: z.string(),
  assignmentId: z.string().uuid("Invalid assignment ID format."),
  completed: z.boolean(),
});

export async function updateStudentAssignment({
  classId,
  studentId,
  assignmentId,
  completed,
}: {
  classId: string;
  studentId: string;
  assignmentId: string;
  completed: boolean;
}) {
  const { userId } = auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const parsed = updateStudentAssignmentSchema.safeParse({
    classId,
    studentId,
    assignmentId,
    completed,
  });

  if (!parsed.success) {
    console.error("Validation error:", parsed.error);
    throw new Error("Invalid input data.");
  }

  const {
    classId: validClassId,
    studentId: validStudentId,
    assignmentId: validAssignmentId,
    completed: validCompleted,
  } = parsed.data;

  try {
    // Execute all operations within a transaction
    const result = await db.transaction(async (tx) => {
      // Fetch the existing student_assignment to ensure it exists and belongs to the user
      const existingAssignment = await tx
        .select()
        .from(student_assignments)
        .where(
          and(
            eq(student_assignments.assignment_id, validAssignmentId),
            eq(student_assignments.class_id, validClassId),
            eq(student_assignments.student_id, validStudentId),
          ),
        )
        .limit(1)
        .get();

      if (!existingAssignment) {
        throw new Error("Student assignment not found.");
      }

      // Permission check (adjust as needed)
      // Assuming each record has a `user_id` field linking it to the user.
      if (existingAssignment.user_id !== userId) {
        throw new Error(
          "You do not have permission to modify this assignment.",
        );
      }

      const updatedData = {
        complete: validCompleted, // Assuming `complete` is a boolean column
        completed_ts: validCompleted ? new Date().toISOString() : null,
      };

      // Execute the update query
      await tx
        .update(student_assignments)
        .set(updatedData)
        .where(
          and(
            eq(student_assignments.assignment_id, validAssignmentId),
            eq(student_assignments.class_id, validClassId),
            eq(student_assignments.student_id, validStudentId),
          ),
        )
        .run();

      // Fetch the updated record
      const updatedAssignment = await tx
        .select()
        .from(student_assignments)
        .where(
          and(
            eq(student_assignments.assignment_id, validAssignmentId),
            eq(student_assignments.class_id, validClassId),
            eq(student_assignments.student_id, validStudentId),
          ),
        )
        .limit(1)
        .get();

      return updatedAssignment;
    });

    return {
      success: true,
      message: "Student assignment updated successfully.",
      data: result,
    };
  } catch (error) {
    console.error("Error updating student assignment:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update student assignment.",
      data: null,
    };
  }
}
// Zod schema for deleting a student assignment
const deleteStudentAssignmentSchema = z.object({
  id: z.string().uuid("Invalid assignment ID format."),
});

export async function deleteStudentAssignment({ id }: { id: string }) {
  "use server";

  const { userId } = auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const parsed = deleteStudentAssignmentSchema.safeParse({ id });
  if (!parsed.success) {
    console.error("Validation error:", parsed.error);
    throw new Error("Invalid input data.");
  }

  const { id: validId } = parsed.data;

  try {
    // Execute all operations within a transaction
    const result = await db.transaction(async (tx) => {
      // Fetch the existing student_assignment to ensure it exists and belongs to the user
      const existingAssignment = await tx
        .select()
        .from(student_assignments)
        .where(eq(student_assignments.id, validId))
        .limit(1)
        .get();

      if (!existingAssignment) {
        throw new Error("Student assignment not found.");
      }

      // Optional: If you have ownership or permission checks, implement them here
      // For example, verify that the current user has rights to delete this assignment
      // Assuming there's a `user_id` field in `student_assignments`
      if (existingAssignment.user_id !== userId) {
        throw new Error(
          "You do not have permission to delete this assignment.",
        );
      }

      // Execute the delete query
      await tx
        .delete(student_assignments)
        .where(eq(student_assignments.id, validId))
        .run();

      return null; // No data to return after deletion
    });

    return {
      success: true,
      message: "Student assignment deleted successfully.",
      data: null,
    };
  } catch (error) {
    console.error("Error deleting student assignment:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete student assignment.",
      data: null,
    };
  }
}
