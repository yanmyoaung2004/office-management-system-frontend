import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
    "/exam/teachers",
    "/operation",
    "/dashboard",
    "/share",
  ];

  // 1. Exact Match Check
  const isStaticValid = staticRoutes.includes(pathname);

  // 2. Dynamic Pattern Checks (Regex or startsWith)
  // Logic for /exam/exams/[ID] and /exam/exams/[ID]/export
  const isExamRoute = pathname.startsWith("/exam/exams/");
  const isExamTeacherRoute = pathname.startsWith("/exam/teachers/");

  // Logic for /intakes/[ID]
  const isIntakeRoute = pathname.startsWith("/intakes/");

  // Logic for /share/[token]
  const isShareRoute = pathname.startsWith("/share/");

  const isValid =
    isStaticValid ||
    isExamRoute ||
    isExamTeacherRoute ||
    isIntakeRoute ||
    isShareRoute;

  // 3. Redirection Logic
  if (!isValid) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes (where your PDF/Word generation code should live)
     * - _next internal files
     * - static assets with extensions
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
