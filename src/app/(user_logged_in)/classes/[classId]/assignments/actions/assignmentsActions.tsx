"use server";

import { z } from "zod";
import { db } from "~/server/db";
import {
  assignments,
  student_assignments,
  student_classes,
} from "~/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { Assignment } from "~/server/db/types";

// Zod schemas for input validation
const createAssignmentSchema = z.object({
  classId: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().nullish(),
  data: z.string().nullish(),
  due_date: z.string().nullish(),
  topic: z.string().nullish(),
  working_date: z.string().nullish(),
});

// export async function createAssignment(
//   input: z.infer<typeof createAssignmentSchema>,
// ) {
//   "use server";

//   const { userId } = auth();
//   if (!userId) {
//     return {
//       success: false,
//       message: "User not authenticated",
//       data: null as Assignment | null,
//     };
//   }

//   const parsed = createAssignmentSchema.safeParse(input);
//   if (!parsed.success) {
//     const errorMsg = parsed.error.issues
//       .map((issue) => issue.message)
//       .join(", ");
//     return {
//       success: false,
//       message: `Validation error: ${errorMsg}`,
//       data: null as Assignment | null,
//     };
//   }

//   const {
//     classId,
//     name,
//     description,
//     data: assignmentData,
//     due_date,
//     topic,
//     working_date,
//   } = parsed.data;

//   try {
//     const newId = randomUUID();
//     await db
//       .insert(assignments)
//       .values({
//         id: newId,
//         user_id: userId,
//         class_id: classId,
//         name,
//         description: description ?? null,
//         data: assignmentData ?? null,
//         due_date: due_date ?? null,
//         topic: topic ?? null,
//         working_date: working_date ?? null,
//       })
//       .run();

//     const createdAssignment = await db
//       .select()
//       .from(assignments)
//       .where(eq(assignments.id, newId))
//       .get();

//     if (!createdAssignment) {
//       throw new Error("Failed to retrieve newly created assignment.");
//     }

//     // Fetch all students for this user and class
//     const classStudents = await db
//       .select()
//       .from(student_classes)
//       .where(eq(student_classes.class_id, classId))
//       .all();

//     // Insert a student_assignments row for each student
//     // Inserting one by one. For better performance, you could batch insert if supported.
//     for (const student of classStudents) {
//       await db
//         .insert(student_assignments)
//         .values({
//           id: randomUUID(),
//           user_id: userId,
//           class_id: classId,
//           student_id: student.student_id,
//           assignment_id: newId,
//           complete: false,
//           completed_ts: null,
//         })
//         .run();
//     }

//     return {
//       success: true,
//       message: "Assignment created successfully.",
//       data: createdAssignment as Assignment,
//     };
//   } catch (error) {
//     console.error("Error creating assignment:", error);
//     return {
//       success: false,
//       message:
//         error instanceof Error ? error.message : "Failed to create assignment",
//       data: null as Assignment | null,
//     };
//   }
// }

export async function createAssignment(
  input: z.infer<typeof createAssignmentSchema>,
) {
  "use server";

  const { userId } = auth();
  if (!userId) {
    return {
      success: false,
      message: "User not authenticated",
      data: null as Assignment | null,
    };
  }

  const parsed = createAssignmentSchema.safeParse(input);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues
      .map((issue) => issue.message)
      .join(", ");
    return {
      success: false,
      message: `Validation error: ${errorMsg}`,
      data: null as Assignment | null,
    };
  }

  const {
    classId,
    name,
    description,
    data: assignmentData,
    due_date,
    topic,
    working_date,
  } = parsed.data;

  try {
    const result = await db.transaction(async (tx) => {
      const newId = randomUUID();

      await tx
        .insert(assignments)
        .values({
          id: newId,
          user_id: userId,
          class_id: classId,
          name,
          description: description ?? null,
          data: assignmentData ?? null,
          due_date: due_date ?? null,
          topic: topic ?? null,
          working_date: working_date ?? null,
        })
        .run();

      const createdAssignment = await tx
        .select()
        .from(assignments)
        .where(eq(assignments.id, newId))
        .get();

      if (!createdAssignment) {
        throw new Error("Failed to retrieve newly created assignment.");
      }

      // Fetch all students for this class
      const classStudents = await tx
        .select()
        .from(student_classes)
        .where(eq(student_classes.class_id, classId))
        .all();

      if (classStudents.length > 0) {
        const studentAssignmentsToInsert = classStudents.map((student) => ({
          id: randomUUID(),
          user_id: userId,
          class_id: classId,
          student_id: student.student_id,
          assignment_id: newId,
          complete: false,
          completed_ts: null,
        }));

        // Bulk insert all student_assignments in one go
        await tx
          .insert(student_assignments)
          .values(studentAssignmentsToInsert)
          .run();
      }

      return createdAssignment;
    });

    return {
      success: true,
      message: "Assignment created successfully.",
      data: result as Assignment,
    };
  } catch (error) {
    console.error("Error creating assignment:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create assignment",
      data: null as Assignment | null,
    };
  }
}

const updateAssignmentSchema = z.object({
  assignmentId: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().nullish(),
  data: z.string().nullish(),
  due_date: z.string().nullish(),
  topic: z.string().nullish(),
  working_date: z.string().nullish(),
});

export async function updateAssignment(
  input: z.infer<typeof updateAssignmentSchema>,
) {
  "use server";

  const { userId } = auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const parsed = updateAssignmentSchema.safeParse(input);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues
      .map((issue) => issue.message)
      .join(", ");
    return {
      success: false,
      message: `Validation error: ${errorMsg}`,
      data: null as Assignment | null,
    };
  }

  const {
    assignmentId,
    name,
    description,
    data,
    due_date,
    topic,
    working_date,
  } = parsed.data;

  try {
    // Ensure the assignment belongs to the user
    const existingAssignment = await db
      .select()
      .from(assignments)
      .where(
        and(eq(assignments.id, assignmentId), eq(assignments.user_id, userId)),
      )
      .get();

    if (!existingAssignment) {
      return {
        success: false,
        message: "Assignment not found or does not belong to the current user.",
        data: null as Assignment | null,
      };
    }

    await db
      .update(assignments)
      .set({
        name,
        description: description ?? null,
        data: data ?? null,
        due_date: due_date ?? null,
        topic: topic ?? null,
        working_date: working_date ?? null,
      })
      .where(eq(assignments.id, assignmentId))
      .run();

    const updatedAssignment = await db
      .select()
      .from(assignments)
      .where(eq(assignments.id, assignmentId))
      .get();

    if (!updatedAssignment) {
      throw new Error("Failed to retrieve updated assignment.");
    }

    return {
      success: true,
      message: "Assignment updated successfully.",
      data: updatedAssignment as Assignment,
    };
  } catch (error) {
    console.error("Error updating assignment:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update assignment",
      data: null as Assignment | null,
    };
  }
}

const deleteAssignmentSchema = z.object({
  assignmentId: z.string(),
});

export async function deleteAssignment(
  input: z.infer<typeof deleteAssignmentSchema>,
) {
  "use server";

  const { userId } = auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const parsed = deleteAssignmentSchema.safeParse(input);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues
      .map((issue) => issue.message)
      .join(", ");
    return {
      success: false,
      message: `Validation error: ${errorMsg}`,
      data: null,
    };
  }

  const { assignmentId } = parsed.data;

  try {
    // Ensure the assignment belongs to the user
    const existingAssignment = await db
      .select()
      .from(assignments)
      .where(
        and(eq(assignments.id, assignmentId), eq(assignments.user_id, userId)),
      )
      .get();

    if (!existingAssignment) {
      return {
        success: false,
        message: "Assignment not found or does not belong to the current user.",
        data: null,
      };
    }

    await db.delete(assignments).where(eq(assignments.id, assignmentId)).run();

    return {
      success: true,
      message: "Assignment deleted successfully.",
      data: null,
    };
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete assignment",
      data: null,
    };
  }
}
