'use server'

import { z } from 'zod';
import { db } from '~/server/db/index';
import { groups, student_groups, students } from '~/server/db/schema';
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import type { Group } from '~/server/db/types';
import { eq } from 'drizzle-orm';

export interface AddGroupResponse {
  success: boolean;
  message: string;
  newGroup?: Group; // Optional, included only on success
}

function generateUuidWithPrefix(prefix: string){
    return `${prefix}${randomUUID()}`
}

// Define the input schema for the form data
const AddGroupSchema = z.object({
  groupName: z.string().min(1, "Group name is required"),
  classId: z.string(),
  studentIds: z.array(z.string()).min(1, "At least one student must be selected"),
});

export async function addGroup(formData: FormData): Promise<AddGroupResponse> {
  // Validate and parse the form data
  const validatedFields = AddGroupSchema.safeParse({
    groupName: formData.get('groupName'),
    classId: formData.get('classId'),
    studentIds: formData.getAll('studentIds'),
  });

  if (!validatedFields.success) {
    return { success: false, message: 'Invalid input. Please check your form data.' };
  }

  const { groupName, classId, studentIds } = validatedFields.data;

  try {
    // Generate a unique group ID
    const groupId = generateUuidWithPrefix("group_");

    // Start a transaction
    await db.transaction(async (tx) => {
      // Insert the new group
      await tx.insert(groups).values({
        group_id: groupId,
        group_name: groupName,
        class_id: classId,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      });

      // Prepare student_groups entries
      const studentGroupEntries = studentIds.map((studentId) => ({
        enrollment_id: generateUuidWithPrefix("enroll_"),
        student_id: studentId,
        group_id: groupId,
        enrollment_date: new Date().toISOString(),
      }));

      // Bulk insert student_groups
      await tx.insert(student_groups).values(studentGroupEntries);
    });

    // Fetch the newly created group with associated students
    const groupData = await db
      .select({
        group_id: groups.group_id,
        group_name: groups.group_name,
        class_id: groups.class_id,
        created_date: groups.created_date,
        updated_date: groups.updated_date,
        student_id: student_groups.student_id,
        student_name_en: students.student_name_en,
        student_name_first_en: students.student_name_first_en,
        student_name_last_en: students.student_name_last_en,
        student_name_alt: students.student_name_alt,
        student_reading_level: students.student_reading_level,
        student_grade: students.student_grade,
        student_sex: students.student_sex,
        student_number: students.student_number,
        student_email: students.student_email,
        joined_date: students.joined_date,
        updated_date_student: students.updated_date,
      })
      .from(groups)
      .leftJoin(student_groups, eq(student_groups.group_id, groups.group_id))
      .leftJoin(students, eq(students.student_id, student_groups.student_id))
      .where(eq(groups.group_id, groupId))
      .execute();

    if (groupData.length === 0) {
      return { success: false, message: 'Group creation failed. No data found.' };
    }

    // Map the fetched data to the Group type
    const newGroup: Group = {
      group_id: groupData[0]?.group_id ?? "",
      group_name: groupData[0]?.group_name ?? "",
      class_id: groupData[0]?.class_id ?? "",
      created_date: groupData[0]?.created_date ?? "",
      updated_date: groupData[0]?.updated_date ?? "",
      students: groupData.map((row) => ({
        student_id: row.student_id ?? "",
        student_name_en: row.student_name_en ?? "",
        student_name_first_en: row.student_name_first_en ?? "",
        student_name_last_en: row.student_name_last_en ?? "",
        student_name_alt: row.student_name_alt ?? "",
        student_reading_level: row.student_reading_level ?? "",
        student_grade: row.student_grade ?? "",
        student_sex: row.student_sex ?? null,
        student_number: row.student_number ?? 0,
        student_email: row.student_email ?? "",
        joined_date: row.joined_date ?? "",
        updated_date: row.updated_date_student ?? "",
        enrollment_date: null,
        redemption_history: []
      })),
    };

    // Revalidate the path to update cached data
    revalidatePath(`/classes/${classId}`);

    return { success: true, message: 'Group created successfully.', newGroup };
  } catch (error) {
    console.error('Failed to create group:', error);
    return { success: false, message: 'Failed to create group. Please try again.' };
  }
}