'use server'

import { revalidatePath } from 'next/cache'
import type { Student } from '~/server/db/types'
import { students } from '~/server/db/schema'
import { db } from '~/server/db/index'
import { eq } from 'drizzle-orm'

export async function updateStudents(updatedStudents: Partial<Student>[]) {
  try {
    await db.transaction(async (tx) => {
      for (const student of updatedStudents) {
        if (!student.student_id) continue;

        const updateFields: Partial<Student> = {};

        (Object.entries(student) as [keyof Student, Student[keyof Student]][]).forEach(([key, value]) => {
          if (key !== 'student_id' && value !== undefined && value !== null && key in students) {
            if (key === 'student_sex') {
              updateFields[key] = value as "male" | "female";
            } else if (key === 'student_number') {
              updateFields[key] = value as number;
            } else if (key !== 'isEditing' && key !== 'enrollment_date' && key !== 'enrollment_id') {
              updateFields[key] = value as string;
            }
          }
        });

        updateFields.updated_date = new Date().toISOString();

        if (Object.keys(updateFields).length > 0) {
          await tx.update(students)
            .set(updateFields)
            .where(eq(students.student_id, student.student_id));
        }
      }
    });

    revalidatePath('/students');
    return { success: true, message: 'Students updated successfully' };
  } catch (error) {
    console.error('Failed to update students:', error);
    return { success: false, message: 'Failed to update students' };
  }
}