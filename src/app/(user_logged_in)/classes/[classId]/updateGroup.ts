'use server'

import { db } from "~/server/db";
import { groups, student_groups } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const UpdateGroupSchema = z.object({
  groupId: z.string(),
  groupName: z.string().min(1, "Group name is required"),
  studentIds: z.array(z.string()),
  classId: z.string(),
});

export async function updateGroup(formData: FormData) {
  console.log("🚀 ~ updateGroup ~ formData:", formData)
  const validatedFields = UpdateGroupSchema.safeParse({
    groupId: formData.get('groupId'),
    groupName: formData.get('groupName'),
    studentIds: formData.getAll('studentIds'),
    classId: formData.get('classId'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid input. Please check your form data.' };
  }

  const { groupId, groupName, studentIds, classId } = validatedFields.data;

  try {
    await db.transaction(async (tx) => {
      // Update group name
      await tx
        .update(groups)
        .set({ 
          group_name: groupName,
          updated_date: new Date().toISOString(),
        })
        .where(eq(groups.group_id, groupId));

      // Delete all existing student associations for this group
      await tx
        .delete(student_groups)
        .where(eq(student_groups.group_id, groupId));

      // Insert new student associations
      for (const studentId of studentIds) {
        await tx.insert(student_groups).values({
          enrollment_id: crypto.randomUUID(), // Generate a new UUID for each enrollment
          group_id: groupId,
          student_id: studentId,
          enrollment_date: new Date().toISOString(),
        });
      }
    });

    revalidatePath(`/classes/${classId}`);
    return { success: true, message: 'Group updated successfully' };
  } catch (error) {
    console.error('Failed to update group:', error);
    return { error: 'Failed to update group. Please try again.' };
  }
}