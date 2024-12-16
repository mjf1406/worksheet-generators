// src/middleware.ts

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from 'next/server';

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

// 3. Export the middleware using Clerk's middleware function
export default clerkMiddleware((auth, request: NextRequest) => {
  // Pass the entire NextRequest object to `isPublicRoute`
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

// 4. Configure the middleware to exclude static files and Next.js internals
export const config = {
  matcher: [
    "/((?!.*\\.[\\w]+$|_next).*)", // Matches all routes except static files and _next
  ],
};
