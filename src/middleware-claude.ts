import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

// Define interfaces for rate limiting
interface RateLimitResult {
  remaining: number;
  reset: number;
  success: boolean;
}

interface RedisPipelineResult {
  error: Error | null;
  result: number;
}

// UUID regex pattern
const classIdRegex = /^\/classes\/class_[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/students(?:\/.*)?$/;

// Public routes matcher
const isPublicRoute = createRouteMatcher([
  /^\/auth\/sign-in(?:\/.*)?$/,
  /^\/auth\/sign-up(?:\/.*)?$/,
  /^\/api\/webhooks(?:\/.*)?$/,
  /^\/$/,
  classIdRegex
]);

// Redis configuration with error handling
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error('❌ REDIS_URL is not defined in environment variables');
}

const redis = new Redis({
  url: redisUrl,
  token: process.env.REDIS_TOKEN,
});

// Rate limiting configuration
const PUBLIC_WINDOW_IN_SECONDS = 15 * 60; // 15 minutes
const PUBLIC_MAX_REQUESTS = 180; // 12 requests per minute
const PROTECTED_WINDOW_IN_SECONDS = 5 * 60; // 5 minutes
const PROTECTED_MAX_REQUESTS = 300; // 60 requests per minute

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
}

async function rateLimit(
  identifier: string,
  windowSeconds: number,
  maxRequests: number
): Promise<RateLimitResult> {
  const key = `rate-limit:${identifier}`;
  
  try {
    // Use multi to make operations atomic
    const pipeline = redis.pipeline();
    pipeline.incr(key);
    pipeline.ttl(key);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const [countResult, ttlResult] = await pipeline.exec() as [RedisPipelineResult, RedisPipelineResult];
    
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (!countResult || !ttlResult || countResult.error || ttlResult.error) {
      throw new Error('Redis pipeline execution failed');
    }
    
    const currentCount = countResult.result;
    const ttl = ttlResult.result;
    
    // Set expiry only if it doesn't exist
    if (ttl === -1) {
      await redis.expire(key, windowSeconds);
    }
    
    const remaining = Math.max(0, maxRequests - currentCount);
    const reset = ttl === -1 ? windowSeconds : ttl;
    
    return { remaining, reset, success: true };
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Fail open - allow request but log error
    return { remaining: 1, reset: 0, success: false };
  }
}

function createRateLimitResponse(formattedReset: string): NextResponse {
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

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const ip = (request.ip ?? request.headers.get('x-forwarded-for')) ?? '127.0.0.1';
  const { userId } = auth();
  const identifier = userId ? `user:${userId}` : `ip:${ip}`;
  const isPublic = isPublicRoute(request);

  // Apply different rate limits based on route type
  const { remaining, reset, success } = await rateLimit(
    identifier,
    isPublic ? PUBLIC_WINDOW_IN_SECONDS : PROTECTED_WINDOW_IN_SECONDS,
    isPublic ? PUBLIC_MAX_REQUESTS : PROTECTED_MAX_REQUESTS
  );

  // If rate limiting failed, log and continue
  if (!success) {
    console.warn(`Rate limiting failed for ${identifier}`);
    // You might want to alert your error monitoring service here
  }

  if (remaining === 0) {
    return createRateLimitResponse(formatTime(reset));
  }

  // Apply authentication check after rate limiting
  if (!isPublic) {
    auth().protect();
  }

  const response = NextResponse.next();
  // Add rate limit headers to response
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', reset.toString());
  
  return response;
});

export const config = {
  matcher: ["/((?!.*\\.[\\w]+$|_next).*)"],
};