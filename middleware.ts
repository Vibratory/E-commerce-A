import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  
  "/:path*",
]);

export default clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) return; // Skip auth
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
