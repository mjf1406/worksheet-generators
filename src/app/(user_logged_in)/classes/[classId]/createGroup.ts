'use server'

import { z } from 'zod';
import { db } from '~/server/db/index';
import { groups, student_groups } from '~/server/db/schema';
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

function generateUuidWithPrefix(prefix: string){
    return `${prefix}${randomUUID()}`
}

// Define the input schema for the form data
const AddGroupSchema = z.object({
  groupName: z.string().min(1, "Group name is required"),
  classId: z.string(),
  studentIds: z.array(z.string()).min(1, "At least one student must be selected"),
});

export async function addGroup(formData: FormData) {
  // Validate and parse the form data
  const validatedFields = AddGroupSchema.safeParse({
    groupName: formData.get('groupName'),
    classId: formData.get('classId'),
    studentIds: formData.getAll('studentIds'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid input. Please check your form data.' };
  }

  const { groupName, classId, studentIds } = validatedFields.data;

  try {
    // Start a transaction
    await db.transaction(async (tx) => {
      // Create the new group
      const groupId = generateUuidWithPrefix("group_");
      await tx.insert(groups).values({
        group_id: groupId,
        group_name: groupName,
        class_id: classId,
      });

      // Associate students with the group
      for (const studentId of studentIds) {
        await tx.insert(student_groups).values({
          enrollment_id: generateUuidWithPrefix("enroll_"),
          student_id: studentId,
          group_id: groupId,
        });
      }
    });
    revalidatePath("/classes");
    return { success: true, message: 'Group created successfully' };
  } catch (error) {
    console.error('Failed to create group:', error);
    return { error: 'Failed to create group. Please try again.' };
  }
}