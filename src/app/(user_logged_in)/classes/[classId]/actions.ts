"use server";

import { z } from 'zod';
import { db } from '~/server/db';
import { behaviors, student_classes, student_groups, students, teacher_classes } from '~/server/db/schema';
import { generateUuidWithPrefix } from '~/server/db/helperFunction';
import { auth } from '@clerk/nextjs/server';
import type { BehaviorData } from './components/StudentDialog';
import type { StudentData } from '~/app/api/getClassesGroupsStudents/route';
import { and, eq, ne } from 'drizzle-orm';
import type { PointRecord } from '~/server/db/types';

const behaviorSchema = z.object({
  name: z.string(),
  point_value: z.number().int(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  color: z.string(),
  class_id: z.string().nullable(),
});

export async function createBehavior(behaviorDataFromClientForm: BehaviorData) {
  const { userId } = auth();
  if (!userId) throw new Error('User not authenticated');

  const parsedData = behaviorSchema.safeParse(behaviorDataFromClientForm);
  if (!parsedData.success) {
    console.error('Validation error:', parsedData.error);
    throw new Error('Invalid input data.');
  }

  const { name, point_value, description, icon, color, class_id } =
    parsedData.data;

  try {
    const newBehavior = {
      behavior_id: generateUuidWithPrefix('behavior_'),
      name,
      point_value: point_value,
      description: description ?? null,
      icon: icon ?? null,
      color,
      class_id: class_id ?? null,
      user_id: userId,
    };

    // Insert the new behavior into the database
    await db.insert(behaviors).values(newBehavior).run();

    return {
      success: true,
      message: 'Behavior added successfully.',
      behavior: newBehavior,
    };
  } catch (error) {
    console.error('Error adding behavior:', error);
    return {
      success: false,
      message: 'Failed to add behavior due to a server error.',
    };
  }
}

export async function applyBehavior(
  behavior_id: string,
  student_data_array: StudentData[],
  class_id: string,
  inputQuantity: number
): Promise<{ success: boolean; message: string }> {
  const { userId } = auth();
  if (!userId) throw new Error("User not authenticated");

  try {
    // Start a transaction
    await db.transaction(async (tx) => {
      // Fetch the behavior details once
      const behavior = await tx
        .select()
        .from(behaviors)
        .where(eq(behaviors.behavior_id, behavior_id))
        .get();

      if (!behavior) {
        throw new Error("Behavior not found");
      }

      if (inputQuantity < 1) {
        throw new Error(`Invalid quantity. Quantity must be at least 1.`);
      }

      const updates = student_data_array.map(async (student_data) => {
        // Fetch the student's enrollment record in the class
        const enrollment = await tx
          .select()
          .from(student_classes)
          .where(
            and(
              eq(student_classes.student_id, student_data.student_id),
              eq(student_classes.class_id, class_id)
            )
          )
          .get();

        if (!enrollment) {
          throw new Error(
            `Student ${student_data.student_id} not enrolled in the class`
          );
        }

        // Calculate the new total points using the behavior's point_value and inputQuantity
        const netPointChange = behavior.point_value * inputQuantity;
        const newPoints = (enrollment.points ?? 0) + netPointChange;

        // Update the point history
        const pointHistory = enrollment.point_history
          ? [...enrollment.point_history]
          : [];

        const newPointRecord: PointRecord = {
          point_id: generateUuidWithPrefix("point_"),
          quantity: netPointChange, // Record the net point change
          date: new Date().toISOString(),
        };

        pointHistory.push(newPointRecord);

        // Update the student's enrollment record with new points and point history
        await tx
          .update(student_classes)
          .set({
            points: newPoints,
            point_history: pointHistory,
          })
          .where(eq(student_classes.enrollment_id, enrollment.enrollment_id))
          .run();
      });

      // Execute all updates concurrently
      await Promise.all(updates);
    });

    return {
      success: true,
      message: "Behavior applied successfully to all selected students.",
    };
  } catch (error) {
    console.error("Error applying behavior:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to apply behavior due to a server error.",
    };
  }
}

const updateStudentSchema = z.object({
  student_id: z.string(),
  student_name_en: z.string().min(1),
  student_name_alt: z.string().optional(),
  student_reading_level: z.string().optional(),
  student_grade: z.string().optional(),
  student_sex: z.enum(["male", "female"]),
  student_number: z.number().int().positive(),
  student_email: z.string().email(),
});

export async function updateStudent(studentDataFromClient: Omit<StudentData | "joined_date", "updated_date">): Promise<{ success: boolean; message: string, data: StudentData | null}> {
  "use server";

  const { userId } = auth();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const parsedData = updateStudentSchema.safeParse(studentDataFromClient);
  if (!parsedData.success) {
    console.error('Validation error:', parsedData.error);
    throw new Error('Invalid input data.');
  }

  const {
    student_id,
    student_name_en,
    student_name_alt,
    student_reading_level,
    student_grade,
    student_sex,
    student_number,
    student_email,
  } = parsedData.data;

  try {
    // Check if email is unique (excluding the current student)
    const existingStudent = await db.select().from(students).where(
      and(
        eq(students.student_email, student_email),
        ne(students.student_id, student_id)
      )
    ).get();

    if (existingStudent) {
      throw new Error('Email already in use by another student.');
    }

    // Update the student in the database
    await db.update(students)
      .set({
        student_name_en,
        student_name_alt,
        student_reading_level,
        student_grade,
        student_sex,
        student_number,
        student_email,
        updated_date: new Date().toISOString(),
      })
      .where(eq(students.student_id, student_id))
      .run();

    // Fetch the updated student
    const updatedStudent = await db.select().from(students).where(eq(students.student_id, student_id)).get();

    if (!updatedStudent) {
      throw new Error('Failed to retrieve updated student.');
    }

    return {
      success: true, 
      message: "Successfully updated student!", 
      data: updatedStudent as unknown as StudentData
    }
  } catch (error) {
    console.error("Error updating student:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update student due to a server error.",
      data: null
    };
  }
}

const deleteStudentSchema = z.object({
  student_id: z.string(),
});

// Define the server action
export async function deleteStudent(studentId: string, classId: string): Promise<{ success: boolean; message: string }> {
  // Authenticate the user
  const { userId } = auth();
  if (!userId) {
    return { success: false, message: "User not authenticated." };
  }

  // Validate the input
  const parsed = deleteStudentSchema.safeParse({ student_id: studentId });
  if (!parsed.success) {
    console.error("Validation error:", parsed.error);
    return { success: false, message: "Invalid input data." };
  }

  const { student_id } = parsed.data;

  try {
    // Check if the student exists
    const student = await db.select().from(students).where(eq(students.student_id, student_id)).get();

    if (!student) {
      return { success: false, message: "Student not found." };
    }

    await db.select()
      .from(teacher_classes)
      .where(and(
        eq(teacher_classes.user_id, userId), 
        eq(teacher_classes.class_id, classId)
      ));

    // Delete the student
    await db.delete(student_classes).where(eq(student_classes.student_id, student_id)).run();
    await db.delete(student_groups).where(eq(student_groups.student_id, student_id)).run();
    await db.delete(students).where(eq(students.student_id, student_id)).run();
    
    return { success: true, message: "Student deleted successfully." };
  } catch (error) {
    console.error("Error deleting student:", error);
    return { success: false, message: "Failed to delete student due to a server error." };
  }
}