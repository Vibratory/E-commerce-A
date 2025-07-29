import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Only allow these routes without auth
const isPublicRoute = createRouteMatcher([
  "/sign-in",
  "/sign-up",
]);

export default clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) return; // Skip auth for sign-in/up
  // Everything else requires authentication
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
