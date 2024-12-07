// src/middleware.ts

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import Redis from 'ioredis';

// Ensure the REDIS_URL is present in the environment
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error('REDIS_URL is not defined in the environment variables');
}

// Redis instance (for production, use ioredis)
const redis = new Redis(redisUrl);

// Rate limit settings
const WINDOW_IN_SECONDS = 15 * 60; // 15 minutes
const MAX_REQUESTS = 100; // Max requests in the 15-minute window

// 1. Define a regex pattern for the dynamic route `/classes/class_<UUID>/students`
const classIdRegex = /^\/classes\/class_[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/students(?:\/.*)?$/;

// 2. Create a route matcher with all public routes using regex
const isPublicRoute = createRouteMatcher([
  /^\/auth\/sign-in(?:\/.*)?$/,        // Public: /auth/sign-in and any subpaths
  /^\/auth\/sign-up(?:\/.*)?$/,        // Public: /auth/sign-up and any subpaths
  /^\/api\/webhooks(?:\/.*)?$/,        // Public: /api/webhooks and any subpaths
  /^\/$/,                              // Public: Root '/'
  classIdRegex                         // Public: /classes/class_<UUID>/students
]);

/**
 * Increment the request count for a given identifier (IP or userId)
 * @param {string} identifier - The unique key (IP or userId)
 * @returns {Promise<{remaining: number, reset: number}>} - Remaining requests and reset time
 */
async function rateLimit(identifier: string) {
  const key = `rate-limit:${identifier}`;
  const currentCount = await redis.incr(key); // Increment request count
  if (currentCount === 1) {
    await redis.expire(key, WINDOW_IN_SECONDS); // Set expiration if this is the first request
  }
  
  const remaining = Math.max(0, MAX_REQUESTS - currentCount);
  const reset = await redis.ttl(key); // Time until the key resets (in seconds)
  
  return { remaining, reset };
}

// 3. Export the middleware using Clerk's middleware function
export default clerkMiddleware(async (auth, request: NextRequest) => {
  const ip = (request.ip ?? request.headers.get('x-forwarded-for')) ?? '127.0.0.1';
  const { userId } = auth();
  
  // Identify users by their userId if authenticated, otherwise by IP
  const identifier = userId ? `user:${userId}` : `ip:${ip}`;

  // Rate limit logic
  const { remaining, reset } = await rateLimit(identifier);
  if (remaining === 0) {
    const response = new NextResponse(
      JSON.stringify({
        message: 'Too many requests, please try again later.',
        retryAfter: reset,
      }),
      { status: 429 }
    );
    response.headers.set('Content-Type', 'application/json');
    response.headers.set('Retry-After', String(reset));
    return response;
  }

  // Pass the entire NextRequest object to `isPublicRoute`
  if (!isPublicRoute(request)) {
    auth().protect();
  }

  return NextResponse.next();
});

// 4. Configure the middleware to exclude static files and Next.js internals
export const config = {
  matcher: [
    "/((?!.*\\.[\\w]+$|_next).*)", // Matches all routes except static files and _next
  ],
};
