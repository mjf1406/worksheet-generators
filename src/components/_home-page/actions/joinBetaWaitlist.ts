"use server";

import { z } from "zod";
import { Redis } from "@upstash/redis";
import { db } from "~/server/db";
import { beta_signups } from "~/server/db/schema";
import { generateUuidWithPrefix } from "~/server/db/helperFunction";

const redisUrl = process.env.REDIS_URL;
const redisToken = process.env.REDIS_TOKEN;
if (!redisUrl) {
  throw new Error('❌ REDIS_URL is not defined in environment variables');
}
if (!redisToken) {
  throw new Error('❌ REDIS_TOKEN is not defined in environment variables');
}

const redis = new Redis({
  url: redisUrl,
  token: redisToken,
});

const RATE_LIMIT_WINDOW_SECONDS = 30 * 60; // 30 minutes
const RATE_LIMIT_MAX_ADDITIONS = 1; // Only one addition allowed per window

const emailSchema = z.string().email();

interface JoinBetaWaitlistResult {
  success: boolean;
  message: string;
}

// Custom Error Interface
interface DBError extends Error {
  code: string;
}

// Type Guard Function
function isDBError(error: unknown): error is DBError {
  return (
    error instanceof Error &&
    typeof (error as DBError).code === 'string'
  );
}

// Helper Function to Format Time
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes > 0) {
    return `${minutes} minute(s) and ${remainingSeconds} second(s)`;
  }
  return `${remainingSeconds} second(s)`;
}

export async function joinBetaWaitlist(
  email: string,
  identifier: string // e.g., userId or ip:user-agent
): Promise<JoinBetaWaitlistResult> {
  const parseResult = emailSchema.safeParse(email);
  if (!parseResult.success) {
    return { success: false, message: "Please enter a valid email address." };
  }

  const rateLimitIdentifier = `waitlist:${identifier}`;

  try {
    const currentCount = (await redis.get<number>(rateLimitIdentifier)) ?? 0;

    if (currentCount >= RATE_LIMIT_MAX_ADDITIONS) {
      const ttl = await redis.ttl(rateLimitIdentifier);
      const formattedReset = formatTime(ttl !== null && ttl > 0 ? ttl : RATE_LIMIT_WINDOW_SECONDS);
      return { 
        success: false, 
        message: `You can join the waitlist again in ${formattedReset}.` 
      };
    }

    await db.insert(beta_signups).values({
      id: generateUuidWithPrefix("beta_"),
      email: email.toLowerCase(), // Normalize email to lowercase
    });

    if (currentCount === 0) {
      await redis.set(rateLimitIdentifier, 1, { ex: RATE_LIMIT_WINDOW_SECONDS });
    } else {
      await redis.incr(rateLimitIdentifier);
    }

    return { success: true, message: "Successfully joined the waitlist!" };
  } catch (error: unknown) {
    if (isDBError(error) && error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return { success: false, message: "This email is already on the waitlist." };
    }

    console.error("Error joining waitlist:", error);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}
