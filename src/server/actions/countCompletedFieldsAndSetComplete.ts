"use server"

import { db } from "../db";
import { eq } from "drizzle-orm";
import { classes as classesTable } from "../db/schema";
import { getClassById } from "./getClassById";
import { auth } from "@clerk/nextjs/server";
import type { Student } from "../db/types";

function countFilledFieldsByClass(
    students: Student[],
    semester: string,
  ): number {
    return students.reduce((count, student) => {
      // Loop through each field in the student's fields
      Object.values(student.student_fields).forEach((field) => {
        // Check if the field exists and is filled for the given semester
        if (
          field &&
          typeof field === "object" &&
          semester in field &&
          field?.[semester as keyof typeof field] != ""
        ) {
          count += 1;
        }
      });
      return count;
    }, 0);
  }

export default async function countCompletedFieldsAndSetComplete(
    classId: string, 
) {
    const { userId } = auth()
    if (!userId) throw new Error("user not authenticated")

    const classData = await getClassById(classId, userId)
    if (!classData) throw new Error("no class data")
    const students: Student[] = classData.students
    const numberOfCompleteFieldsS1 = countFilledFieldsByClass(students, "s1")
    const numberOfCompleteFieldsS2 = countFilledFieldsByClass(students, "s2")
    const completedS1 = (numberOfCompleteFieldsS1 / (17 * classData?.students.length)) === 1 ? true : false as boolean
    const completedS2 = (numberOfCompleteFieldsS2 / (17 * classData?.students.length)) === 1 ? true : false as boolean

    await db
        .update(classesTable)
        .set( { complete: {s1: completedS1, s2: completedS2 } } )
        .where( 
            eq(classesTable.class_id, classId)
        )
}