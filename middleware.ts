import { NextRequest, NextResponse } from "next/server";

import { verifySessionToken } from "@/lib/auth";

const PUBLIC_PATHS = [
  "/",
  "/auth/login",
  "/auth/register",
  "/api/health",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/register",
  "/download",
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((publicPath) => {
    if (publicPath === "/download") {
      return pathname.startsWith("/download");
    }

    return pathname === publicPath || pathname.startsWith(`${publicPath}/`);
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("sharevault_session")?.value;

  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const session = await verifySessionToken(token);

    if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
      const loginUrl = new URL("/auth/login?error=Admin access required", request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
