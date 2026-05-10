import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Define routes. Use strings for static, Regex objects for dynamic.
  const staticRoutes = [
    "/login",
    "/users",
    "/migration",

    "/unauthorized",

    "/admission",
    "/admission/dashboard",
    "/admission/enrollment",
    "/admission/inquiries",
    "/admission/intakes",
    "/admission/majors",

    "/finance",
    "/finance/students",
    "/finance/intakes",

    "/exam",
    "/exam/intakes",
    "/exam/exams",

    "/operation",
  ];

  // 2. Optimized Validation Logic
  // Check static routes first (faster), then test the dynamic pattern
  const isStaticValid = staticRoutes.includes(pathname);
  const isDynamicValid = pathname.startsWith("/intakes/");

  const isValid = isStaticValid || isDynamicValid;

  // 3. Handle Invalid Routes
  // Note: 'isInternal' is removed because your matcher below already excludes them.
  if (!isValid) {
    // Prevent infinite redirect loops if the user is already on /dashboard
    if (pathname !== "/dashboard") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

// 4. Refined Matcher
// This ensures the middleware doesn't even run for assets or internal Next.js files.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - All files with extensions (e.g. .svg, .png, .jpg, .pdf)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
