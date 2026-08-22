"use server";

import { getSessionCookie, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const token = await getSessionCookie();

  if (!token) {
    return null;
  }

  try {
    const payload = await verifySessionToken(token);
    return prisma.user.findUnique({
      where: { id: payload.userId },
      include: { balance: true },
    });
  } catch {
    return null;
  }
}

export async function getUserReferralData() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const referralStats = await prisma.referral.findMany({
    where: { referrerId: user.id },
    include: {
      referredUser: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    referralCode: user.referralCode,
    referralLink: `${baseUrl}/auth/register?ref=${user.referralCode}`,
    totalReferrals: referralStats.length,
    activeReferrals: referralStats.filter((item) => item.status === "ACTIVE").length,
    referrals: referralStats,
    availableBalance: Number(user.balance?.availableBalance ?? 0),
  };
}
