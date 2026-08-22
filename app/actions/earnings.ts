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
      include: {
        balance: true,
      },
    });
  } catch {
    return null;
  }
}

export async function getUserEarningsSummary() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const events = await prisma.revenueEvent.findMany({
    where: {
      userId: user.id,
      status: "APPROVED",
    },
    orderBy: { createdAt: "desc" },
  });

  const summary = events.reduce<{
    gross: number;
    uploader: number;
    referral: number;
    platform: number;
  }>(
    (acc: { gross: number; uploader: number; referral: number; platform: number }, event: (typeof events)[number]) => {
      acc.gross += Number(event.grossRevenue);
      acc.uploader += Number(event.uploaderShare);
      acc.referral += Number(event.referralShare);
      acc.platform += Number(event.platformShare);
      return acc;
    },
    { gross: 0, uploader: 0, referral: 0, platform: 0 },
  );

  return {
    grossRevenue: summary.gross,
    uploaderShare: summary.uploader,
    referralShare: summary.referral,
    platformShare: summary.platform,
    totalEvents: events.length,
    availableBalance: Number(user.balance?.availableBalance ?? 0),
    pendingBalance: Number(user.balance?.pendingBalance ?? 0),
  };
}

export async function getUserRevenueEvents() {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  return prisma.revenueEvent.findMany({
    where: {
      userId: user.id,
      status: "APPROVED",
    },
    include: {
      file: {
        select: {
          id: true,
          originalName: true,
        },
      },
      download: {
        select: {
          id: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 40,
  });
}
