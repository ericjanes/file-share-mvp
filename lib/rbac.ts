import { redirect } from "next/navigation";

import { getSessionCookie, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentSessionUser() {
  const token = await getSessionCookie();

  if (!token) {
    return null;
  }

  try {
    const payload = await verifySessionToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function requireAdminSession() {
  const user = await getCurrentSessionUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/auth/login?error=Admin access required");
  }

  return user;
}
