// rewardItemActions.ts

"use server";

import { z } from 'zod';
import { db } from '~/server/db';
import { classes, points, reward_items, student_classes, teacher_classes, achievements as achievementsTable } from '~/server/db/schema';
import { generateUuidWithPrefix } from '~/server/db/helperFunction';
import { auth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';
import type { Point, PointType, RedemptionRecord, RewardItem, RewardItemUpdate } from '~/server/db/types';
import type { StudentData } from '~/app/api/getClassesGroupsStudents/route';
import { DEFAULT_REDEMPTION_ITEMS } from '~/lib/constants';

// Define the Zod schema for reward item data
const rewardItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().optional(),
  price: z.number().nonnegative("price must be a non-negative number"),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  class_id: z.string().nullable().optional(),
  type: z.enum(["solo", "group", "class"]),
  achievements: z
    .array(
      z.object({
        id: z.string().optional(), // Optional for existing achievements
        threshold: z
          .number()
          .int()
          .nonnegative("Threshold must be a non-negative integer"),
        name: z.string().nonempty("Achievement name is required"),
      }),
    )
    .optional().nullable(),
});

// Define the return type
type RewardItemData = z.infer<typeof rewardItemSchema>;

export async function createRewardItem(rewardItemDataFromClientForm: RewardItemData) {
  // Authenticate the user
  const { userId } = auth();
  if (!userId) throw new Error('User not authenticated');

  // Validate the incoming data
  const parsedData = rewardItemSchema.safeParse(rewardItemDataFromClientForm);
  if (!parsedData.success) {
    console.error('Validation error:', parsedData.error);
    throw new Error('Invalid input data.');
  }

  // Destructure the validated data
  const { name, price, description, icon, class_id, type, title, achievements } = parsedData.data;

  if (!class_id) throw new Error("Class ID is undefined.");

  try {
    // Generate a unique ID for the new reward item
    const newRewardItem: RewardItem = {
      item_id: generateUuidWithPrefix('item_'),
      name,
      price,
      title: title ?? null,
      description: description ?? null,
      icon: icon ?? null,
      class_id: class_id,
      type,
      user_id: userId,
    };

    // Begin a transaction to ensure atomicity
    await db.transaction(async (tx) => {
      // Insert the new reward item into the 'reward_items' table
      await tx.insert(reward_items).values(newRewardItem).run();

      // Check if there are any achievements to insert
      if (achievements && achievements.length > 0) {
        // Map the achievements to the appropriate format for insertion
        const achievementRecords = achievements.map((achievement) => ({
          id: generateUuidWithPrefix('ach_'), // Generate a unique ID for each achievement
          reward_item_id: newRewardItem.item_id, // Associate with the newly created reward item
          class_id: class_id, // Associate with the class
          user_id: userId, // Associate with the user
          threshold: achievement.threshold,
          name: achievement.name,
          behavior_id: null, // Set to null or assign appropriately if available
          // 'created_date' and 'updated_date' are handled by default
        }));

        // Insert all achievements into the 'achievements' table
        await tx.insert(achievementsTable).values(achievementRecords).run();
      }
    });

    // If the transaction completes successfully, return a success response
    return {
      success: true,
      message: 'Reward item and achievements added successfully.',
      rewardItem: newRewardItem,
    };
  } catch (error) {
    // Log the error and throw a server error
    console.error('Error adding reward item and achievements:', error);
    throw new Error('Failed to add reward item and achievements due to a server error.');
  }
}

// Update Reward Item
const updateRewardItemSchema = z.object({
  item_id: z.string(),
  name: z.string().min(1, "Name is required"),
  price: z.number().nonnegative("price must be a non-negative number"),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  class_id: z.string().nullable().optional(),
  type: z.enum(["solo", "group", "class"]),
});

type UpdateRewardItemInput = z.infer<typeof updateRewardItemSchema>;

export async function updateRewardItem(formData: RewardItemUpdate) {
  const { userId } = auth();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Extract and parse data from FormData
  const data: Partial<UpdateRewardItemInput> = {
    item_id: formData.item_id,
    name: formData.name,
    price: formData.price,
    description: formData.description as string | null,
    icon: formData.icon as string | null,
    class_id: formData.class_id as string | null,
    type: formData.type,
  };

  // Validate input data
  const parsedData = updateRewardItemSchema.safeParse(data);
  if (!parsedData.success) {
    console.error('Validation error:', parsedData.error);
    throw new Error('Invalid input data.');
  }

  const { item_id, ...updateFields } = parsedData.data;

  try {
    // Ensure the reward item exists and belongs to the user
    const existingRewardItem = await db
      .select()
      .from(reward_items)
      .where(eq(reward_items.item_id, item_id))
      .get();

    if (!existingRewardItem) {
      throw new Error('Reward item not found.');
    }

    if (existingRewardItem.user_id !== userId) {
      throw new Error('Unauthorized to update this reward item.');
    }

    // Update the reward item
    await db
      .update(reward_items)
      .set({
        ...updateFields,
        updated_date: new Date().toISOString(),
      })
      .where(eq(reward_items.item_id, item_id))
      .run();

    return {
      success: true,
      message: 'Reward item updated successfully.',
    };
  } catch (error) {
    console.error('Error updating reward item:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update reward item.');
  }
}

// Delete Reward Item
const deleteRewardItemSchema = z.object({
  item_id: z.string(),
});

type DeleteRewardItemInput = z.infer<typeof deleteRewardItemSchema>;

export async function deleteRewardItem(formData: FormData) {
  const { userId } = auth();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Extract and parse data from FormData
  const data: DeleteRewardItemInput = {
    item_id: formData.get('item_id') as string,
  };

  // Validate input data
  const parsedData = deleteRewardItemSchema.safeParse(data);
  if (!parsedData.success) {
    console.error('Validation error:', parsedData.error);
    throw new Error('Invalid input data.');
  }

  const { item_id } = parsedData.data;

  try {
    // Ensure the reward item exists and belongs to the user
    const existingRewardItem = await db
      .select()
      .from(reward_items)
      .where(eq(reward_items.item_id, item_id))
      .get();

    if (!existingRewardItem) {
      throw new Error('Reward item not found.');
    }

    if (existingRewardItem.user_id !== userId) {
      throw new Error('Unauthorized to delete this reward item.');
    }

    // Delete the reward item
    await db
      .delete(reward_items)
      .where(eq(reward_items.item_id, item_id))
      .run();

    return {
      success: true,
      message: 'Reward item deleted successfully.',
    };
  } catch (error) {
    console.error('Error deleting reward item:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete reward item.');
  }
}

export async function applyRewardItem(
  item_id: string,
  student_data_array: StudentData[],
  class_id: string,
  inputQuantity: number
): Promise<{ success: boolean; message: string }> {
  console.log("🚀 ~ student_data_array:", student_data_array)
  const { userId } = auth();
  if (!userId) throw new Error("User not authenticated");

  try {
    // Start a transaction
    await db.transaction(async (tx) => {
      // Fetch the reward item details once
      const rewardItem = await tx
        .select()
        .from(reward_items)
        .where(eq(reward_items.item_id, item_id))
        .get();

      if (!rewardItem) {
        throw new Error("Reward item not found");
      }

      if (inputQuantity < 1) {
        throw new Error(`Invalid quantity. Quantity must be at least 1.`);
      }

      const totalCost = rewardItem.price * inputQuantity;

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

        // Check if student has enough points
        const totalPoints = student_data.point_history?.reduce((sum: number, point: Point) => sum + point.number_of_points, 0) ?? 0;
        // const currentPoints = enrollment.points ?? 0;
        if (totalPoints < totalCost) {
          throw new Error(
            `Student ${student_data.student_id} does not have enough points to redeem this reward item`
          );
        }

        // Calculate the new total points
        // const newPoints = currentPoints - totalCost;

        // Update the redemption history
        const redemptionHistory = enrollment.redemption_history
          ? [...enrollment.redemption_history]
          : [];

        const newRedemptionRecord: RedemptionRecord = {
          item_id: item_id,
          date: new Date().toISOString(),
          quantity: rewardItem.price,
        };

        // Add the redemption record inputQuantity times
        for (let i = 0; i < inputQuantity; i++) {
          redemptionHistory.push(newRedemptionRecord);
        }

        // Update the student's enrollment record with new points and redemption history
        // await tx
        //   .update(student_classes)
        //   .set({
        //     points: newPoints,
        //     redemption_history: redemptionHistory,
        //   })
        //   .where(eq(student_classes.enrollment_id, enrollment.enrollment_id));

        // Now, insert rows into the 'points' table, one per reward item per quantity
        // So for inputQuantity, we need to insert 'inputQuantity' rows
        const pointRows = [];
        for (let i = 0; i < inputQuantity; i++) {
          const pointType: PointType = 'redemption';

          pointRows.push({
            id: generateUuidWithPrefix("point_"),
            user_id: userId,
            class_id: class_id,
            student_id: student_data.student_id,
            behavior_id: null,
            reward_item_id: item_id,
            type: pointType,
            number_of_points: -rewardItem.price, // Deducting points
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
      message: "Reward item redeemed successfully.",
    };
  } catch (error) {
    console.error("Error applying reward item:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to apply reward item due to a server error.",
    };
  }
}

const addDefaultRewardItemsSchema = z.object({
  classId: z.string(), // Ensure classId is a valid UUID
});

export async function addDefaultRewardItems(
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
  const parsedData = addDefaultRewardItemsSchema.safeParse({ classId });
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
      // Fetch all existing reward item names for the class and user
      const existingRewardItems = await tx
        .select({ name: reward_items.name })
        .from(reward_items)
        .where(
          and(
            eq(reward_items.class_id, validatedClassId),
            eq(reward_items.user_id, userId)
          )
        )
        .all();

      const existingRewardItemNames = existingRewardItems.map((row) => row.name);

      // Filter out reward items that already exist
      const rewardItemsToInsert = DEFAULT_REDEMPTION_ITEMS.filter(
        (item) => !existingRewardItemNames.includes(item.name)
      ).map((item) => ({
        item_id: generateUuidWithPrefix('item_'),
        name: item.name,
        price: item.price,
        description: item.description ?? null,
        icon: item.icon ?? null,
        class_id: validatedClassId,
        user_id: userId,
        type: item.type,
      }));

      if (rewardItemsToInsert.length === 0) {
        throw new Error('All default reward items already exist for this class.');
      }

      // Insert the new reward items into the database
      await tx.insert(reward_items).values(rewardItemsToInsert).run();
    });

    return {
      success: true,
      message: 'Default reward items added successfully.',
    };
  } catch (error) {
    console.error('Error adding default reward items:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to add default reward items due to a server error.',
    };
  }
}