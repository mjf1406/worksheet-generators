'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '~/server/db'
import { students, student_classes } from '~/server/db/schema'
import { randomUUID } from "crypto";

const studentSchema = z.object({
    student_name_first_en: z.string().min(1, "English name is required"),
    student_name_last_en: z.string().min(1, "English name is required"),
    student_name_alt: z.string().optional().nullable(),
    student_reading_level: z.string().min(1, "Reading level is required"),
    student_grade: z.string().min(1, "Grade is required"),
    student_sex: z.enum(['male', 'female'], { required_error: "Sex is required" }),
    student_number: z.number().int().positive("Student number must be positive"),
    student_email: z.string().optional().nullable(),
    joined_date: z.string().optional(),
    updated_date: z.string().optional(),
})

const addStudentsSchema = z.object({
    classId: z.string(),
    students: z.array(studentSchema),
})

function generateUuidWithPrefix(prefix: string){
    return `${prefix}${randomUUID()}`
}

export async function addStudents(input: z.infer<typeof addStudentsSchema>) {
  try {
    console.log("Received input:", input);
    const { classId, students: newStudents } = addStudentsSchema.parse({
      ...input,
      students: input.students.map(student => ({
        ...student,
        student_number: Number(student.student_number),
        student_name_alt: student.student_name_alt ?? null,
        student_email: student.student_email ?? null,
      }))
    });
    console.log("Parsed students:", newStudents);

    await db.transaction(async (tx) => {
      for (const student of newStudents) {
        const studentId = generateUuidWithPrefix('student_')
        
        // Insert new student
        await tx.insert(students).values({
          student_id: studentId,
          student_name_en: `${student.student_name_first_en} ${student.student_name_last_en}`,
          student_name_first_en: student.student_name_first_en,
          student_name_last_en: student.student_name_last_en,
          student_name_alt: student.student_name_alt,
          student_reading_level: student.student_reading_level,
          student_grade: student.student_grade,
          student_sex: student.student_sex,
          student_number: student.student_number,
          student_email: student.student_email,
          joined_date: new Date().toISOString(),
          updated_date: new Date().toISOString(),
        })

        // Associate student with the class
        await tx.insert(student_classes).values({
          enrollment_id: generateUuidWithPrefix("enrollment_"),
          student_id: studentId,
          class_id: classId,
          points: null,
          absent_dates: null,
          point_history: null,
          enrollment_date: new Date().toISOString(),
        })
      }
    })

    // Revalidate the class page to reflect the updates
    revalidatePath(`/classes/${classId}`)

    return { success: true, message: 'Students added successfully' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Zod validation error:', error.errors);
      return { success: false, message: 'Invalid input', errors: error.errors }
    }
    console.error('Failed to add students:', error)
    return { success: false, message: 'Failed to add students' }
  }
}