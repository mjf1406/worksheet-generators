"use server";

import { z } from "zod";
import { db } from "~/server/db";
import { topics } from "~/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

// Zod schemas for input validation
const createTopicSchema = z.object({
  classId: z.string(),
  name: z.string().min(1, "Name is required."),
});

export async function createTopic({
  classId,
  name,
}: {
  classId: string;
  name: string;
}) {
  ("use server");

  const { userId } = auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const parsed = createTopicSchema.safeParse({ classId, name });
  if (!parsed.success) {
    console.error("Validation error:", parsed.error);
    throw new Error("Invalid input data.");
  }

  const { classId: validClassId, name: validName } = parsed.data;

  try {
    const newId = randomUUID();
    await db
      .insert(topics)
      .values({
        id: newId,
        user_id: userId,
        class_id: validClassId,
        name: validName,
      })
      .run();

    const createdTopic = await db
      .select()
      .from(topics)
      .where(eq(topics.id, newId))
      .get();

    return {
      success: true,
      message: "Topic created successfully",
      data: createdTopic,
    };
  } catch (error) {
    console.error("Error creating topic:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create topic.",
      data: null,
    };
  }
}

const updateTopicSchema = z.object({
  topicId: z.string().uuid("Invalid topic id format."),
  name: z.string().min(1, "Name is required."),
});

export async function updateTopic({
  topicId,
  name,
}: {
  topicId: string;
  name: string;
}) {
  "use server";

  const { userId } = auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const parsed = updateTopicSchema.safeParse({ topicId, name });
  if (!parsed.success) {
    console.error("Validation error:", parsed.error);
    throw new Error("Invalid input data.");
  }

  const { topicId: validTopicId, name: validName } = parsed.data;

  try {
    // Ensure the topic belongs to the user
    const existingTopic = await db
      .select()
      .from(topics)
      .where(and(eq(topics.id, validTopicId), eq(topics.user_id, userId)))
      .get();

    if (!existingTopic) {
      throw new Error(
        "Topic not found or does not belong to the current user.",
      );
    }

    await db
      .update(topics)
      .set({ name: validName })
      .where(eq(topics.id, validTopicId))
      .run();

    const updatedTopic = await db
      .select()
      .from(topics)
      .where(eq(topics.id, validTopicId))
      .get();

    return {
      success: true,
      message: "Topic updated successfully.",
      data: updatedTopic,
    };
  } catch (error) {
    console.error("Error updating topic:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update topic.",
      data: null,
    };
  }
}

const deleteTopicSchema = z.object({
  topicId: z.string().uuid("Invalid topic id format."),
});

export async function deleteTopic({ topicId }: { topicId: string }) {
  "use server";

  const { userId } = auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const parsed = deleteTopicSchema.safeParse({ topicId });
  if (!parsed.success) {
    console.error("Validation error:", parsed.error);
    throw new Error("Invalid input data.");
  }

  const { topicId: validTopicId } = parsed.data;

  try {
    // Ensure the topic belongs to the user
    const existingTopic = await db
      .select()
      .from(topics)
      .where(and(eq(topics.id, validTopicId), eq(topics.user_id, userId)))
      .get();

    if (!existingTopic) {
      throw new Error(
        "Topic not found or does not belong to the current user.",
      );
    }

    await db.delete(topics).where(eq(topics.id, validTopicId)).run();

    return {
      success: true,
      message: "Topic deleted successfully.",
      data: null,
    };
  } catch (error) {
    console.error("Error deleting topic:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete topic.",
      data: null,
    };
  }
}
