"use server";

import { z } from 'zod';
import { db } from '~/server/db';
import { student_classes, student_groups, students, teacher_classes } from '~/server/db/schema';
import { auth } from '@clerk/nextjs/server';
import type { StudentData } from '~/app/api/getClassesGroupsStudents/route';
import { and, eq, ne } from 'drizzle-orm';

const updateStudentSchema = z.object({
  student_id: z.string(),
  student_name_first_en: z.string().min(1),
  student_name_last_en: z.string().min(1),
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
    student_name_first_en,
    student_name_last_en,
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
        student_name_first_en,
        student_name_last_en,
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