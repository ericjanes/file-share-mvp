import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function createAuditLog({
  userId,
  entityType,
  entityId,
  action,
  message,
  metadata,
}: {
  userId?: string | null;
  entityType: string;
  entityId?: string | null;
  action: "USER_SIGNUP" | "USER_LOGIN" | "USER_LOGOUT" | "FILE_UPLOAD" | "FILE_DELETE" | "FILE_DOWNLOAD" | "FILE_VISIBILITY_CHANGE" | "REFERRAL_CREATED" | "REVENUE_POSTED" | "WITHDRAWAL_REQUEST" | "ADMIN_ACTION" | "SECURITY_EVENT";
  message: string;
  metadata?: Prisma.InputJsonValue | null;
}) {
  return prisma.auditLog.create({
    data: {
      userId: userId ?? null,
      entityType,
      entityId: entityId ?? null,
      action,
      message,
      metadata: metadata ?? undefined,
    },
  });
}
