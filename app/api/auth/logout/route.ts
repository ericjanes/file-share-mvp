import { NextRequest, NextResponse } from "next/server";

import { logoutUser } from "@/app/actions/auth";

export async function POST(request: NextRequest) {
  try {
    await logoutUser();
    return NextResponse.redirect(new URL("/", request.url));
  } catch {
    return NextResponse.redirect(new URL("/", request.url));
  }
}
