"use server";

import { z } from 'zod';
import { db } from '~/server/db';
import { behaviors, student_classes } from '~/server/db/schema';
import { generateUuidWithPrefix } from '~/server/db/helperFunction';
import { auth } from '@clerk/nextjs/server';
import type { BehaviorData } from './components/StudentDialog';
import type { StudentData } from '~/app/api/getClassesGroupsStudents/route';
import { and, eq } from 'drizzle-orm';
import type { PointRecord } from '~/server/db/types';

const behaviorSchema = z.object({
  name: z.string(),
  point_value: z.number().int(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  color: z.string(),
  class_id: z.string().nullable(),
});

export async function createBehavior(behaviorDataFromClientForm: BehaviorData) {
  const { userId } = auth();
  if (!userId) throw new Error('User not authenticated');

  const parsedData = behaviorSchema.safeParse(behaviorDataFromClientForm);
  if (!parsedData.success) {
    console.error('Validation error:', parsedData.error);
    throw new Error('Invalid input data.');
  }

  const { name, point_value, description, icon, color, class_id } =
    parsedData.data;

  try {
    const newBehavior = {
      behavior_id: generateUuidWithPrefix('behavior_'),
      name,
      point_value: point_value,
      description: description ?? null,
      icon: icon ?? null,
      color,
      class_id: class_id ?? null,
      user_id: userId,
    };

    // Insert the new behavior into the database
    await db.insert(behaviors).values(newBehavior).run();

    return {
      success: true,
      message: 'Behavior added successfully.',
      behavior: newBehavior,
    };
  } catch (error) {
    console.error('Error adding behavior:', error);
    return {
      success: false,
      message: 'Failed to add behavior due to a server error.',
    };
  }
}

export async function applyBehavior(
  behavior_id: string,
  student_data_array: StudentData[],
  class_id: string,
  inputQuantity: number
): Promise<{ success: boolean; message: string }> {
  const { userId } = auth();
  if (!userId) throw new Error("User not authenticated");

  try {
    // Start a transaction
    await db.transaction(async (tx) => {
      // Fetch the behavior details once
      const behavior = await tx
        .select()
        .from(behaviors)
        .where(eq(behaviors.behavior_id, behavior_id))
        .get();

      if (!behavior) {
        throw new Error("Behavior not found");
      }

      if (inputQuantity < 1) {
        throw new Error(`Invalid quantity. Quantity must be at least 1.`);
      }

      const updates = student_data_array.map(async (student_data) => {
        // Fetch the student's enrollment record in the class
        const enrollment = await tx
          .select()
          .from(student_classes)
          .where(
            and(
              eq(student_classes.student_id, student_data.student_id),
              eq(student_classes.class_id, class_id)
            )
          )
          .get();

        if (!enrollment) {
          throw new Error(
            `Student ${student_data.student_id} not enrolled in the class`
          );
        }

        // Calculate the new total points using the behavior's point_value and inputQuantity
        const netPointChange = behavior.point_value * inputQuantity;
        const newPoints = (enrollment.points ?? 0) + netPointChange;

        // Update the point history
        const pointHistory = enrollment.point_history
          ? [...enrollment.point_history]
          : [];

        const newPointRecord: PointRecord = {
          point_id: generateUuidWithPrefix("point_"),
          quantity: netPointChange, // Record the net point change
          date: new Date().toISOString(),
        };

        pointHistory.push(newPointRecord);

        // Update the student's enrollment record with new points and point history
        await tx
          .update(student_classes)
          .set({
            points: newPoints,
            point_history: pointHistory,
          })
          .where(eq(student_classes.enrollment_id, enrollment.enrollment_id))
          .run();
      });

      // Execute all updates concurrently
      await Promise.all(updates);
    });

    return {
      success: true,
      message: "Behavior applied successfully to all selected students.",
    };
  } catch (error) {
    console.error("Error applying behavior:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to apply behavior due to a server error.",
    };
  }
}

const updateBehaviorSchema = z.object({
    behavior_id: z.string(),
    name: z.string().min(1, "Name is required"),
    point_value: z.number().int(),
    description: z.string().nullable(),
    icon: z.string().nullable(),
    color: z.string(),
    class_id: z.string().nullable(),
  });
  
  // Define the return type
  type UpdateBehaviorInput = z.infer<typeof updateBehaviorSchema>;
  
  export async function updateBehavior(formData: FormData) {
    // Authenticate the user
    const { userId } = auth();
    if (!userId) {
      throw new Error('User not authenticated');
    }
  
    // Extract and parse data from FormData
    const data: Partial<UpdateBehaviorInput> = {
      behavior_id: formData.get('behavior_id') as string,
      name: formData.get('name') as string,
      point_value: parseInt(formData.get('point_value') as string, 10),
      description: formData.get('description') as string | null,
      icon: formData.get('icon') as string | null,
      color: formData.get('color') as string,
      class_id: formData.get('class_id') as string | null,
    };
  
    // Validate input data
    const parsedData = updateBehaviorSchema.safeParse(data);
    if (!parsedData.success) {
      throw new Error('Invalid input data.');
    }
  
    const { behavior_id, ...updateFields } = parsedData.data;
    console.log("🚀 ~ updateBehavior ~ updateFields:", updateFields)
  
    try {
      // Ensure the behavior exists and belongs to the user
      const existingBehavior = await db
        .select()
        .from(behaviors)
        .where(eq(behaviors.behavior_id, behavior_id))
        .get();
  
      if (!existingBehavior) {
        throw new Error('Behavior not found.');
      }
  
      if (existingBehavior.user_id !== userId) {
        throw new Error('Unauthorized to update this behavior.');
      }
  
      // Update the behavior
      await db
        .update(behaviors)
        .set({
          ...updateFields,
          updated_date: new Date().toISOString(),
        })
        .where(eq(behaviors.behavior_id, behavior_id))
        .run();
  
      return {
        success: true,
        message: 'Behavior updated successfully.',
      };
    } catch (error) {
      console.error('Error updating behavior:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update behavior.');
    }
  }

const deleteBehaviorSchema = z.object({
  behavior_id: z.string(),
});

// Define the return type
type DeleteBehaviorInput = z.infer<typeof deleteBehaviorSchema>;

export async function deleteBehavior(formData: FormData) {
  // Authenticate the user
  const { userId } = auth();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Extract and parse data from FormData
  const data: DeleteBehaviorInput = {
    behavior_id: formData.get('behavior_id') as string,
  };

  // Validate input data
  const parsedData = deleteBehaviorSchema.safeParse(data);
  if (!parsedData.success) {
    console.error('Validation error:', parsedData.error);
    throw new Error('Invalid input data.');
  }

  const { behavior_id } = parsedData.data;

  try {
    // Ensure the behavior exists and belongs to the user
    const existingBehavior = await db
      .select()
      .from(behaviors)
      .where(eq(behaviors.behavior_id, behavior_id))
      .get();

    if (!existingBehavior) {
      throw new Error('Behavior not found.');
    }

    if (existingBehavior.user_id !== userId) {
      throw new Error('Unauthorized to delete this behavior.');
    }

    // Delete the behavior
    await db
      .delete(behaviors)
      .where(eq(behaviors.behavior_id, behavior_id))
      .run();

    return {
      success: true,
      message: 'Behavior deleted successfully.',
    };
  } catch (error) {
    console.error('Error deleting behavior:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete behavior.');
  }
}