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
  class_id: string
) {
  const { userId } = auth();
  if (!userId) throw new Error('User not authenticated');

  try {
    // Fetch the behavior details once
    const behavior = await db
      .select()
      .from(behaviors)
      .where(eq(behaviors.behavior_id, behavior_id))
      .get();

    if (!behavior) {
      throw new Error('Behavior not found');
    }

    // Loop over each student and apply the behavior
    for (const student_data of student_data_array) {
      // Fetch the student's enrollment record in the class
      const enrollment = await db
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

      // Calculate the new total points
      const newPoints = (enrollment.points ?? 0) + behavior.point_value;

      // Update the point history
      const pointHistory = enrollment.point_history
        ? enrollment.point_history
        : [];

      const newPointRecord: PointRecord = {
        point_id: generateUuidWithPrefix('point_'),
        quantity: behavior.point_value,
        date: new Date().toISOString(),
      };

      pointHistory.push(newPointRecord);

      // Update the student's enrollment record with new points and point history
      await db
        .update(student_classes)
        .set({
          points: newPoints,
          point_history: pointHistory,
        })
        .where(eq(student_classes.enrollment_id, enrollment.enrollment_id))
        .run();
    }

    return {
      success: true,
      message: 'Behavior applied successfully to all selected students.',
    };
  } catch (error) {
    console.error('Error applying behavior:', error);
    return {
      success: false,
      message: 'Failed to apply behavior due to a server error.',
    };
  }
}
