"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSessionCookie, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withdrawalRequestSchema } from "@/lib/validators";

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

export async function getUserBalanceSummary() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const balance = await prisma.userBalance.findUnique({
    where: { userId: user.id },
  });

  return {
    availableBalance: Number(balance?.availableBalance ?? 0),
    pendingBalance: Number(balance?.pendingBalance ?? 0),
    lifetimeEarnings: Number(balance?.lifetimeEarnings ?? 0),
  };
}

export async function getUserWithdrawals() {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  return prisma.withdrawal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPendingWithdrawals() {
  return prisma.withdrawal.findMany({
    where: { status: "PENDING" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          balance: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function requestWithdrawal(formData: FormData) {
  const token = await getSessionCookie();

  if (!token) {
    redirect("/auth/login?error=Please log in to request a withdrawal");
  }

  let payload;
  try {
    payload = await verifySessionToken(token);
  } catch {
    redirect("/auth/login?error=Your session has expired");
  }

  const parsed = withdrawalRequestSchema.safeParse({
    amount: Number(formData.get("amount")),
    method: String(formData.get("method") ?? ""),
    accountInfo: String(formData.get("accountInfo") ?? ""),
  });

  if (!parsed.success) {
    redirect("/dashboard?error=Please enter a valid withdrawal request");
  }

  const { amount, method, accountInfo } = parsed.data;

  const balance = await prisma.userBalance.findUnique({
    where: { userId: payload.userId },
  });

  if (!balance) {
    redirect("/dashboard?error=Balance record not found");
  }

  if (amount <= 0 || Number(balance.availableBalance) < amount) {
    redirect("/dashboard?error=Requested amount exceeds your available balance");
  }

  const withdrawal = await prisma.$transaction(async (tx) => {
    const created = await tx.withdrawal.create({
      data: {
        userId: payload.userId,
        amount,
        method,
        accountInfo,
        status: "PENDING",
      },
    });

    await tx.userBalance.update({
      where: { userId: payload.userId },
      data: {
        availableBalance: { decrement: amount },
        pendingBalance: { increment: amount },
      },
    });

    await tx.balanceTransaction.create({
      data: {
        userId: payload.userId,
        type: "DEBIT",
        amount,
        currency: "USD",
        relatedEntityType: "WITHDRAWAL",
        relatedEntityId: created.id,
        description: "Withdrawal request created",
        status: "APPROVED",
      },
    });

    return created;
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/withdrawals");
  revalidatePath("/admin/withdrawals");

  redirect(`/dashboard?success=Withdrawal request #${withdrawal.id.slice(0, 8)} submitted for review`);
}

export async function reviewWithdrawal(formData: FormData) {
  const token = await getSessionCookie();

  if (!token) {
    redirect("/auth/login?error=Please log in to review withdrawals");
  }

  let payload;
  try {
    payload = await verifySessionToken(token);
  } catch {
    redirect("/auth/login?error=Your session has expired");
  }

  if (payload.role !== "ADMIN") {
    redirect("/dashboard?error=Admin access is required");
  }

  const withdrawalId = String(formData.get("withdrawalId") ?? "");
  const action = String(formData.get("action") ?? "");
  const notes = String(formData.get("notes") ?? "");

  if (!withdrawalId || !["APPROVED", "REJECTED"].includes(action)) {
    redirect("/admin/withdrawals?error=Invalid withdrawal review action");
  }

  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id: withdrawalId },
    include: {
      user: {
        include: {
          balance: true,
        },
      },
    },
  });

  if (!withdrawal) {
    redirect("/admin/withdrawals?error=Withdrawal not found");
  }

  if (withdrawal.status !== "PENDING") {
    redirect("/admin/withdrawals?error=This withdrawal is no longer pending");
  }

  if (action === "APPROVED") {
    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: "APPROVED",
        processedAt: new Date(),
        notes: notes.trim() || "Approved by admin",
      },
    });
  }

  if (action === "REJECTED") {
    await prisma.$transaction(async (tx) => {
      await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: "REJECTED",
          processedAt: new Date(),
          notes: notes.trim() || "Rejected by admin",
        },
      });

      await tx.userBalance.update({
        where: { userId: withdrawal.userId },
        data: {
          availableBalance: { increment: withdrawal.amount },
          pendingBalance: { decrement: withdrawal.amount },
        },
      });

      await tx.balanceTransaction.create({
        data: {
          userId: withdrawal.userId,
          type: "CREDIT",
          amount: withdrawal.amount,
          currency: "USD",
          relatedEntityType: "WITHDRAWAL",
          relatedEntityId: withdrawalId,
          description: "Rejected withdrawal restored to available balance",
          status: "APPROVED",
        },
      });
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/withdrawals");
  revalidatePath("/admin/withdrawals");

  redirect("/admin/withdrawals?success=Withdrawal review saved");
}
