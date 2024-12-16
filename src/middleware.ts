import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

// 1. Define a regex pattern for the dynamic route `/classes/class_<UUID>/students`
// UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
const classIdRegex = /^\/classes\/class_[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/students(?:\/.*)?$/;

// 2. Create a route matcher with all public routes using regex
const isPublicRoute = createRouteMatcher([
  /^\/auth\/sign-in(?:\/.*)?$/,        // Public: /auth/sign-in and any subpaths
  /^\/auth\/sign-up(?:\/.*)?$/,        // Public: /auth/sign-up and any subpaths
  /^\/api\/webhooks(?:\/.*)?$/,        // Public: /api/webhooks and any subpaths
  /^\/$/,                               // Public: Root '/'
  classIdRegex                          // Public: /classes/class_<UUID>/students
]);

// Ensure the REDIS_URL is present in the environment
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

const WINDOW_IN_SECONDS = 15 * 60; // 15 minutes
const MAX_REQUESTS = 180; // Average of 1 request every 5 seconds over 15 minutes

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
  const [currentCount, ttl] = await redis.multi()
    .incr(key)
    .ttl(key)
    .exec();

  if (currentCount === 1) {
    await redis.expire(key, WINDOW_IN_SECONDS);
  }

  const remaining = Math.max(0, MAX_REQUESTS - currentCount);
  const reset = ttl !== null && ttl > 0 ? ttl : WINDOW_IN_SECONDS;
  return { remaining, reset };
}


export default clerkMiddleware(async (auth, request: NextRequest) => {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const ip = xForwardedFor
    ? xForwardedFor?.split(',')?.[0]?.trim()
    : '127.0.0.1';
  const { userId } = auth();
  const identifier = userId 
    ? `user:${userId}` 
    : `ip:${ip}:${request.headers.get('user-agent')}`;


  const { remaining, reset } = await rateLimit(identifier);
  
  if (remaining === 0) {
    const formattedReset = formatTime(reset);
    const response = new NextResponse(
      JSON.stringify({ 
        message: 'Too many requests, please try again later.', 
        retryAfter: reset,
        humanReadable: formattedReset
      }),
      { status: 429 }
    );
    response.headers.set('Content-Type', 'application/json');
    response.headers.set('Retry-After', reset.toString());
    response.headers.set('Human-Readable', formattedReset)
    return response;
  }

  if (!isPublicRoute(request)) {
    auth().protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\.[\\w]+$|_next).*)"],
};
