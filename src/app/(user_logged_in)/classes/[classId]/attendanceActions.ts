// attendanceActions.ts

"use server";

import { db } from '~/server/db';
import { student_classes } from '~/server/db/schema';
import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';

export async function saveAttendance(
  class_id: string,
  date: string,
  absent_student_ids: string[]
): Promise<{ success: boolean; message: string }> {
  const { userId } = auth();
  if (!userId) {
    return { success: false, message: 'User not authenticated.' };
  }

  try {
    // Start a transaction
    await db.transaction(async (tx) => {
      // Fetch all enrollments for the class
      const enrollments = await tx
        .select()
        .from(student_classes)
        .where(eq(student_classes.class_id, class_id))
        .all();

      // Create a mapping of student_id to enrollment
      const enrollmentMap = new Map(
        enrollments.map((enrollment) => [enrollment.student_id, enrollment])
      );

      // Process each enrollment
      for (const enrollment of enrollments) {
        const studentId = enrollment.student_id;
        const isAbsent = absent_student_ids.includes(studentId);
        let absentDates = enrollment.absent_dates ?? [];

        if (isAbsent) {
          // Add the date if not already present
          if (!absentDates.includes(date)) {
            absentDates.push(date);
          }
        } else {
          // Remove the date if present
          absentDates = absentDates.filter((d) => d !== date);
        }

        // Update the enrollment record
        await tx
          .update(student_classes)
          .set({
            absent_dates: absentDates,
          })
          .where(eq(student_classes.enrollment_id, enrollment.enrollment_id))
          .run();
      }
    });

    return { success: true, message: 'Attendance saved successfully.' };
  } catch (error) {
    console.error('Error saving attendance:', error);
    return { success: false, message: 'Failed to save attendance.' };
  }
}
