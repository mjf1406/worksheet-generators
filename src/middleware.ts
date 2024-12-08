import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

// Ensure the REDIS_URL is present in the environment
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error('❌ REDIS_URL is not defined in environment variables');
}

// Upstash Redis (this is fully compatible with Edge Runtime)
const redis = new Redis({
  url: redisUrl,
  token: process.env.REDIS_TOKEN, // Use this if you have a separate token for Upstash
});

// const WINDOW_IN_SECONDS = 15 * 60; // 15 minutes
// const MAX_REQUESTS = 90000; // Max requests in the 15-minute window
const WINDOW_IN_SECONDS = 60; // 1 minute
const MAX_REQUESTS = 12; // Average of 1 request every 5 seconds

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
}

async function rateLimit(identifier: string) {
  const key = `rate-limit:${identifier}`;
  const currentCount = await redis.incr(key);
  if (currentCount === 1) {
    await redis.expire(key, WINDOW_IN_SECONDS);
  }
  const remaining = Math.max(0, MAX_REQUESTS - currentCount);
  const reset = await redis.ttl(key);
  return { remaining, reset };
}

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const ip = (request.ip ?? request.headers.get('x-forwarded-for')) ?? '127.0.0.1';
  const { userId } = auth();
  const identifier = userId ? `user:${userId}` : `ip:${ip}`;

  const { remaining, reset } = await rateLimit(identifier);
  if (remaining === 0) {
    const formattedReset = formatTime(reset);
    const response = new NextResponse(
      JSON.stringify({ 
        message: 'Too many requests, please try again later.', 
        retryAfter: formattedReset 
      }),
      { status: 429 }
    );
    response.headers.set('Content-Type', 'application/json');
    response.headers.set('Retry-After', formattedReset);
    return response;
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\.[\\w]+$|_next).*)"],
};
