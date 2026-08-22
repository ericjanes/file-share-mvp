"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSessionCookie, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getAdminUser() {
  const token = await getSessionCookie();
  if (!token) {
    return null;
  }

  try {
    const payload = await verifySessionToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.role !== "ADMIN") {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function getAdminOverviewStats() {
  const [users, files, reports, downloads, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.file.count(),
    prisma.report.count({ where: { status: { in: ["OPEN", "REVIEWED"] } } }),
    prisma.download.count(),
    prisma.revenueEvent.aggregate({
      _sum: {
        grossRevenue: true,
        uploaderShare: true,
        referralShare: true,
        platformShare: true,
      },
      where: {
        status: "APPROVED",
      },
    }),
  ]);

  const pendingWithdrawals = await prisma.withdrawal.aggregate({
    _sum: { amount: true },
    where: { status: "PENDING" },
  });

  const suspendedUsers = await prisma.user.count({ where: { status: "SUSPENDED" } });
  const hiddenFiles = await prisma.file.count({ where: { status: "HIDDEN" } });

  return {
    totalUsers: users,
    totalFiles: files,
    openReports: reports,
    totalDownloads: downloads,
    grossRevenue: Number(revenue._sum.grossRevenue ?? 0),
    uploaderShare: Number(revenue._sum.uploaderShare ?? 0),
    referralShare: Number(revenue._sum.referralShare ?? 0),
    platformShare: Number(revenue._sum.platformShare ?? 0),
    pendingWithdrawalAmount: Number(pendingWithdrawals._sum.amount ?? 0),
    suspendedUsers,
    hiddenFiles,
  };
}

export async function getViolationReports() {
  return prisma.report.findMany({
    where: {
      status: { in: ["OPEN", "REVIEWED"] },
    },
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      file: {
        select: {
          id: true,
          originalName: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getAdminUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function getAuditLogs() {
  return prisma.auditLog.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function toggleUserStatus(formData: FormData) {
  const token = await getSessionCookie();
  if (!token) {
    redirect("/auth/login?error=Please log in to continue");
  }

  let payload;
  try {
    payload = await verifySessionToken(token);
  } catch {
    redirect("/auth/login?error=Your session has expired");
  }

  const admin = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!admin || admin.role !== "ADMIN") {
    redirect("/dashboard?error=Admin access required");
  }

  const userId = String(formData.get("userId") ?? "");
  const action = String(formData.get("action") ?? "");

  if (!userId || !["BAN", "UNBAN"].includes(action)) {
    redirect("/admin/users?error=Invalid moderation action");
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    redirect("/admin/users?error=User not found");
  }

  const nextStatus = action === "BAN" ? "SUSPENDED" : "ACTIVE";

  await prisma.user.update({
    where: { id: userId },
    data: {
      status: nextStatus,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/dashboard");
  redirect(`/admin/users?success=User ${targetUser.email} was ${action === "BAN" ? "banned" : "unbanned"}`);
}

export async function handleViolationAction(formData: FormData) {
  const token = await getSessionCookie();
  if (!token) {
    redirect("/auth/login?error=Please log in to continue");
  }

  let payload;
  try {
    payload = await verifySessionToken(token);
  } catch {
    redirect("/auth/login?error=Your session has expired");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard?error=Admin access required");
  }

  const reportId = String(formData.get("reportId") ?? "");
  const action = String(formData.get("action") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!reportId || !["RESOLVED", "REJECTED"].includes(action)) {
    redirect("/admin?error=Invalid violation action");
  }

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      file: true,
      creator: true,
    },
  });

  if (!report) {
    redirect("/admin?error=Report not found");
  }

  if (action === "RESOLVED") {
    await prisma.$transaction(async (tx) => {
      await tx.report.update({
        where: { id: reportId },
        data: {
          status: "RESOLVED",
          details: notes || report.details || "Resolved by admin",
        },
      });

      if (report.creatorId) {
        await tx.user.update({
          where: { id: report.creatorId },
          data: { status: "SUSPENDED" },
        });
      }

      if (report.fileId && report.file) {
        await tx.file.update({
          where: { id: report.fileId },
          data: {
            status: "HIDDEN",
            visibility: "UNLISTED",
          },
        });
      }
    });
  }

  if (action === "REJECTED") {
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: "REJECTED",
        details: notes || "Rejected after review",
      },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  redirect("/admin?success=Violation report updated");
}
