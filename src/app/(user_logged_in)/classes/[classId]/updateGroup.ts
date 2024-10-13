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

const DeleteGroupSchema = z.object({
  groupId: z.string(),
  classId: z.string(),
});

export async function updateGroup(formData: FormData) {
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
    return { message: 'Failed to update group. Please try again.' };
  }
}

export async function deleteGroup(formData: FormData): Promise<{ success: boolean; message: string }> {
  const validatedFields = DeleteGroupSchema.safeParse({
    groupId: formData.get('groupId'),
    classId: formData.get('classId'),
  });

  if (!validatedFields.success) {
    console.error('Validation error:', validatedFields.error);
    return { success: false, message: 'Invalid input. Please check your data.' };
  }

  const { groupId, classId } = validatedFields.data;

  try {
    await db.transaction(async (tx) => {
      const deletedStudentGroups = await tx
        .delete(student_groups)
        .where(eq(student_groups.group_id, groupId))
        .returning();
      const deletedGroup = await tx
        .delete(groups)
        .where(eq(groups.group_id, groupId))
        .returning();
      
      if (deletedGroup.length === 0) {
        throw new Error('Group not found');
      }
    });

    revalidatePath(`/classes/${classId}`);
    return { success: true, message: 'Group deleted successfully' };
  } catch (error) {
    console.error("Failed to delete group:", error);
    return { 
      success: false, 
      message: "Failed to delete group. Please try again."
    };
  }
}