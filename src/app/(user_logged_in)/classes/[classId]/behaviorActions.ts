"use server";

import { z } from 'zod';
import { db } from '~/server/db';
import { behaviors, classes, points, student_classes, teacher_classes, achievements as achievementsTable} from '~/server/db/schema';
import { generateUuidWithPrefix } from '~/server/db/helperFunction';
import { auth } from '@clerk/nextjs/server';
import type { BehaviorData } from './components/StudentDialog';
import type { StudentData } from '~/app/api/getClassesGroupsStudents/route';
import { and, desc, eq, inArray } from 'drizzle-orm';
import type { PointType } from '~/server/db/types';
import { DEFAULT_BEHAVIORS } from '~/lib/constants';
import type { BehaviorNew } from './components/EditBehaviorDialog';
import type { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';

// behaviorActions.ts or similar

const behaviorSchema = z.object({
  name: z.string(),
  title: z.string().optional().nullable(),
  point_value: z.number().int(),
  description: z.string().nullable(),
  icon: z
    .object({
      name: z.custom<IconName>(),
      prefix: z.custom<IconPrefix>(),
    })
    .optional(),
  color: z.string(),
  class_id: z.string().nullable(),
  achievements: z
    .array(
      z.object({
        threshold: z.number().int().nonnegative("Threshold must be a non-negative integer"),
        name: z.string().nonempty("Achievement name is required"),
      }),
    )
    .optional(),
});
//   const { userId } = auth();
//   if (!userId) throw new Error('User not authenticated');

//   const parsedData = behaviorSchema.safeParse(behaviorDataFromClientForm);
//   if (!parsedData.success) {
//     console.error('Validation error:', parsedData.error);
//     throw new Error('Invalid input data.');
//   }

//   const { name, point_value, description, icon, color, class_id } =
//     parsedData.data;

//   if (!class_id) throw new Error("class_id is undefined.")
  
//   try {
//     const newBehavior = {
//       behavior_id: generateUuidWithPrefix('behavior_'),
//       name,
//       point_value: point_value,
//       description: description ?? null,
//       icon: icon ?? null,
//       color,
//       class_id: class_id,
//       user_id: userId,
//     };

//     // Insert the new behavior into the database
//     await db.insert(behaviors).values(newBehavior).run();

//     return {
//       success: true,
//       message: 'Behavior added successfully.',
//       behavior: newBehavior,
//     };
//   } catch (error) {
//     console.error('Error adding behavior:', error);
//     return {
//       success: false,
//       message: 'Failed to add behavior due to a server error.',
//     };
//   }
// }

// behaviorActions.ts or similar

export async function createBehavior(behaviorDataFromClientForm: BehaviorData) {
  const { userId } = auth();
  if (!userId) throw new Error('User not authenticated');

  const parsedData = behaviorSchema.safeParse(behaviorDataFromClientForm);
  if (!parsedData.success) {
    console.error('Validation error:', parsedData.error);
    throw new Error('Invalid input data.');
  }

  const { name, title, point_value, description, icon, color, class_id, achievements } = parsedData.data;

  if (!class_id) throw new Error("class_id is undefined.");

  try {
    await db.transaction(async (tx) => {
      const newBehavior = {
        behavior_id: generateUuidWithPrefix('behavior_'),
        name,
        title: title ?? null,
        point_value: point_value, // Use point_value directly
        description: description ?? null,
        icon: icon ? `${icon.prefix} ${icon.name}` :  null,
        color,
        class_id,
        user_id: userId,
      };

      // Insert the new behavior into the database
      await tx.insert(behaviors).values(newBehavior).run();

      // If achievementsData are provided, insert them into the achievementsData table
      if (achievements && achievements.length > 0) {
        const achievementRows = achievements.map((achievement) => ({
          id: generateUuidWithPrefix('ach_'),
          behavior_id: newBehavior.behavior_id,
          reward_item_id: null,
          class_id: class_id,
          user_id: userId,
          threshold: achievement.threshold,
          name: achievement.name,
        }));

        await tx.insert(achievementsTable).values(achievementRows).run();
      }
    });

    return {
      success: true,
      message: 'Behavior and associated achievements added successfully.',
    };
  } catch (error) {
    console.error('Error adding behavior and achievements:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to add behavior and achievements due to a server error.');
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

      // For each student in student_data_array
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

        // Calculate the net point change
        const netPointChange = behavior.point_value * inputQuantity;
        const newPoints = (enrollment.points ?? 0) + netPointChange;

        // // Update the point history
        // const pointHistory = enrollment.point_history
        //   ? [...enrollment.point_history]
        //   : [];

        // const newPointRecord: PointRecord = {
        //   point_id: generateUuidWithPrefix("point_"),
        //   quantity: netPointChange, // Record the net point change
        //   date: new Date().toISOString(),
        // };

        // pointHistory.push(newPointRecord);

        // // Update the student's enrollment record with new points and point history
        // await tx
        //   .update(student_classes)
        //   .set({
        //     points: newPoints,
        //     point_history: pointHistory,
        //   })
        //   .where(eq(student_classes.enrollment_id, enrollment.enrollment_id));

        // Now, insert rows into the 'points' table, one per behavior per quantity
        // So for inputQuantity, we need to insert 'inputQuantity' rows
        const pointRows = [];
        for (let i = 0; i < inputQuantity; i++) {
          const pointType: PointType = behavior.point_value >= 0 ? 'positive' : 'negative';

          pointRows.push({
            id: generateUuidWithPrefix('point_'),
            user_id: userId,
            class_id: class_id,
            student_id: student_data.student_id,
            behavior_id: behavior_id,
            reward_item_id: null,
            type: pointType, // Explicitly typed
            number_of_points: behavior.point_value,
            created_date: new Date().toISOString(),
            updated_date: new Date().toISOString(),
          });
        }

        // Insert the point rows into the 'points' table
        await tx.insert(points).values(pointRows).run();
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


// behaviorActions.ts or similar

const updateBehaviorSchema = z.object({
  behavior_id: z.string(),
  name: z.string().min(1, "Name is required"),
  title: z.string().optional(),
  point_value: z.number().int(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  color: z.string(),
  class_id: z.string(),
  achievements: z
    .array(
      z.object({
        id: z.string().optional(), // Optional for existing achievements
        threshold: z.number().int().nonnegative("Threshold must be a non-negative integer"),
        name: z.string().nonempty("Achievement name is required"),
      }),
    )
    .optional(),
});

// Define the return type
type UpdateBehaviorInput = z.infer<typeof updateBehaviorSchema>;

export async function updateBehavior(behaviorData: BehaviorNew): Promise<{ success: boolean; message?: string }> {
  // Authenticate the user
  const { userId } = auth();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Validate input data
  const parsedData = updateBehaviorSchema.safeParse(behaviorData);
  if (!parsedData.success) {
    // Extract and concatenate error messages
    const errorMessages = parsedData.error.errors.map(err => err.message).join(', ');
    throw new Error(`Invalid input data: ${errorMessages}`);
  }

  const { behavior_id, name, title, point_value, description, icon, color, class_id, achievements } = parsedData.data;

  try {
    await db.transaction(async (tx) => {
      // Ensure the behavior exists and belongs to the user
      const existingBehavior = await tx
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
      await tx
        .update(behaviors)
        .set({
          name,
          title: title ?? existingBehavior.title,
          point_value, // Use point_value directly
          description: description ?? existingBehavior.description,
          icon: icon ?? existingBehavior.icon,
          color,
          updated_date: new Date().toISOString(),
        })
        .where(eq(behaviors.behavior_id, behavior_id))
        .run();

      // Handle achievements
      if (achievements) {
        // Fetch existing achievements for the behavior
        const existingAchievements = await tx
          .select()
          .from(achievementsTable) // Ensure correct table name
          .where(eq(achievementsTable.behavior_id, behavior_id))
          .all();

        const existingAchievementIds = existingAchievements.map((a) => a.id);

        const incomingAchievementIds = achievements
          .filter((a) => a.id)
          .map((a) => a.id);

        // Determine which achievements to delete
        const achievementsToDelete = existingAchievementIds.filter(
          (id) => !incomingAchievementIds.includes(id),
        );

        // Delete removed achievements
        if (achievementsToDelete.length > 0) {
          await tx
            .delete(achievementsTable)
            .where(
              and(
                eq(achievementsTable.behavior_id, behavior_id),
                inArray(achievementsTable.id, achievementsToDelete)
              )
            )
            .run();
        }

        // Upsert achievements
        for (const achievement of achievements) {
          if (achievement.id && existingAchievementIds.includes(achievement.id)) {
            // Update existing achievement
            await tx
              .update(achievementsTable)
              .set({
                threshold: achievement.threshold,
                name: achievement.name,
                updated_date: new Date().toISOString(),
              })
              .where(eq(achievementsTable.id, achievement.id))
              .run();
          } else {
            // Insert new achievement
            await tx.insert(achievementsTable).values({
              id: generateUuidWithPrefix('achievement_'),
              behavior_id,
              reward_item_id: null, // Assuming this is nullable
              class_id,
              user_id: userId,
              threshold: achievement.threshold,
              name: achievement.name,
              created_date: new Date().toISOString(),
              updated_date: new Date().toISOString(),
            }).run();
          }
        }
      }
    });

    return {
      success: true,
      message: 'Behavior and achievements updated successfully.',
    };
  } catch (error) {
    console.error('Error updating behavior and achievements:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Failed to update behavior and achievements.' };
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

const addDefaultBehaviorsSchema = z.object({
  classId: z.string(), // Ensure classId is a valid UUID
});

export async function addDefaultBehaviors(
  classId: string
): Promise<{ success: boolean; message: string }> {
  // Authenticate the user
  const { userId } = auth();
  if (!userId) {
    return {
      success: false,
      message: 'User not authenticated.',
    };
  }

  // Validate the input
  const parsedData = addDefaultBehaviorsSchema.safeParse({ classId });
  if (!parsedData.success) {
    console.error('Validation error:', parsedData.error);
    return {
      success: false,
      message: 'Invalid class ID.',
    };
  }

  const { classId: validatedClassId } = parsedData.data;

  try {
    // Verify that the class exists
    const existingClass = await db
      .select()
      .from(classes)
      .where(eq(classes.class_id, validatedClassId))
      .get();

    if (!existingClass) {
      return {
        success: false,
        message: 'Class not found.',
      };
    }

    // Verify if the user is associated with the class in teacher_classes
    const teacherAssociation = await db
      .select()
      .from(teacher_classes)
      .where(
        and(
          eq(teacher_classes.class_id, validatedClassId),
          eq(teacher_classes.user_id, userId)
        )
      )
      .get();

    if (!teacherAssociation) {
      return {
        success: false,
        message: 'You do not have permission to modify this class.',
      };
    }

    // Start a transaction to ensure atomicity
    await db.transaction(async (tx) => {
      // Fetch all existing behavior names for the class and user
      const existingBehaviors = await tx
        .select({ name: behaviors.name })
        .from(behaviors)
        .where(
          and(
            eq(behaviors.class_id, validatedClassId),
            eq(behaviors.user_id, userId)
          )
        )
        .all(); // Use .all() to fetch all matching records

      const existingBehaviorNames = existingBehaviors.map((row) => row.name);

      // Filter out behaviors that already exist
      const behaviorsToInsert = DEFAULT_BEHAVIORS.filter(
        (behavior) => !existingBehaviorNames.includes(behavior.name)
      ).map((behavior) => ({
        behavior_id: generateUuidWithPrefix('behavior_'),
        name: behavior.name,
        point_value: behavior.point_value,
        description: behavior.description ?? null,
        icon: behavior.icon ?? null,
        color: behavior.color,
        class_id: validatedClassId,
        user_id: userId,
        // created_date and updated_date are set by default via the table schema
      }));

      if (behaviorsToInsert.length === 0) {
        throw new Error(
          'All default behaviors already exist for this class.'
        );
      }

      // Insert the new behaviors into the database
      await tx.insert(behaviors).values(behaviorsToInsert).run();
    });

    return {
      success: true,
      message: 'Default behaviors added successfully.',
    };
  } catch (error) {
    console.error('Error adding default behaviors:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to add default behaviors due to a server error.',
    };
  }
}
export async function deleteLastBehaviorOccurrence(
  behavior_id: string,
  student_id: string,
  class_id: string
): Promise<{ success: boolean; message: string }> {
  const { userId } = auth();
  if (!userId) throw new Error("User not authenticated");

  try {
    await db.transaction(async (tx) => {
      // First find the most recent point entry for this behavior, student, and class
      const lastPoint = await tx
        .select()
        .from(points)
        .where(
          and(
            eq(points.behavior_id, behavior_id),
            eq(points.student_id, student_id),
            eq(points.class_id, class_id),
            eq(points.user_id, userId)
          )
        )
        .orderBy((points) => desc(points.created_date))
        .limit(1)
        .get();

      if (!lastPoint) {
        throw new Error("No behavior occurrences found to delete");
      }

      // Delete the found point
      await tx
        .delete(points)
        .where(eq(points.id, lastPoint.id))
        .run();
    });

    return {
      success: true,
      message: "Last behavior occurrence deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting behavior occurrence:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete behavior occurrence due to a server error.",
    };
  }
}