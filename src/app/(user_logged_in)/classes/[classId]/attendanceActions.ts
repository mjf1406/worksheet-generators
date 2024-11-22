// attendanceActions.ts

"use server";

import { db } from '~/server/db';
import { absent_dates, student_classes } from '~/server/db/schema';
import { auth } from '@clerk/nextjs/server';
import { and, eq, inArray } from 'drizzle-orm';
import { generateUuidWithPrefix } from '~/server/db/helperFunction';

// export async function saveAttendance(
//   class_id: string,
//   date: string,
//   absent_student_ids: string[]
// ): Promise<{ success: boolean; message: string }> {
//   const { userId } = auth();
//   if (!userId) {
//     return { success: false, message: 'User not authenticated.' };
//   }

//   try {
//     // Start a transaction
//     await db.transaction(async (tx) => {
//       // Fetch all enrollments for the class
//       const enrollments = await tx
//         .select()
//         .from(student_classes)
//         .where(eq(student_classes.class_id, class_id))
//         .all();

//       // Create a mapping of student_id to enrollment
//       const enrollmentMap = new Map(
//         enrollments.map((enrollment) => [enrollment.student_id, enrollment])
//       );

//       // Process each enrollment
//       for (const enrollment of enrollments) {
//         const studentId = enrollment.student_id;
//         const isAbsent = absent_student_ids.includes(studentId);
//         let absentDates = enrollment.absent_dates ?? [];

//         if (isAbsent) {
//           // Add the date if not already present
//           if (!absentDates.includes(date)) {
//             absentDates.push(date);
//           }
//         } else {
//           // Remove the date if present
//           absentDates = absentDates.filter((d) => d !== date);
//         }

//         // Update the enrollment record
//         await tx
//           .update(student_classes)
//           .set({
//             absent_dates: absentDates,
//           })
//           .where(eq(student_classes.enrollment_id, enrollment.enrollment_id))
//           .run();
//       }
//     });

//     return { success: true, message: 'Attendance saved successfully.' };
//   } catch (error) {
//     console.error('Error saving attendance:', error);
//     return { success: false, message: 'Failed to save attendance.' };
//   }
// }

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

      // Create a Set of enrolled student_ids
      const enrolledStudentIds = new Set(enrollments.map((enrollment) => enrollment.student_id));

      // Validate absent_student_ids to include only enrolled students
      const validAbsentStudentIds = absent_student_ids.filter((student_id) =>
        enrolledStudentIds.has(student_id)
      );

      // Fetch existing absence records for the class on the date
      const existingAbsences = await tx
        .select()
        .from(absent_dates)
        .where(
          and(eq(absent_dates.class_id, class_id), eq(absent_dates.date, date))
        )
        .all();

      // Create a Set of student_ids who are currently marked as absent on that date
      const existingAbsentStudentIds = new Set(
        existingAbsences.map((record) => record.student_id)
      );

      // Determine students to add (absent now but not previously)
      const studentsToAdd = validAbsentStudentIds.filter(
        (student_id) => !existingAbsentStudentIds.has(student_id)
      );

      // Determine students to remove (previously absent but not absent now)
      const studentsToRemove = Array.from(existingAbsentStudentIds).filter(
        (student_id) => !validAbsentStudentIds.includes(student_id)
      );

      // Insert absence records for studentsToAdd
      if (studentsToAdd.length > 0) {
        const absenceRecordsToInsert = studentsToAdd.map((student_id) => ({
          id: generateUuidWithPrefix('absence_'),
          user_id: userId,
          class_id: class_id,
          student_id: student_id,
          date: date,
          created_date: new Date().toISOString(),
          updated_date: new Date().toISOString(),
        }));

        await tx.insert(absent_dates).values(absenceRecordsToInsert).run();
      }

      // Delete absence records for studentsToRemove
      if (studentsToRemove.length > 0) {
        await tx
          .delete(absent_dates)
          .where(
            and(
              eq(absent_dates.class_id, class_id),
              eq(absent_dates.date, date),
              inArray(absent_dates.student_id, studentsToRemove)
            )
          )
          .run();
      }
      
    });

    return { success: true, message: 'Attendance saved successfully.' };
  } catch (error) {
    console.error('Error saving attendance:', error);
    return { success: false, message: 'Failed to save attendance.' };
  }
}
