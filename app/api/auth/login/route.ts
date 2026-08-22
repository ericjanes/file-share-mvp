import { NextRequest, NextResponse } from "next/server";

import { loginUser } from "@/app/actions/auth";

function isRedirectError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const redirectLike = error as Error & { digest?: string };
  return error.message === "NEXT_REDIRECT" || redirectLike.digest === "NEXT_REDIRECT";
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  try {
    await loginUser(formData);
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    if (error instanceof Error && (error.message === "NEXT_REDIRECT" || isRedirectError(error))) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(message)}`, request.url));
  }
}
