"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { storageProvider } from "@/lib/storage";
import { getSessionCookie, verifySessionToken } from "@/lib/auth";
import { MAX_UPLOAD_SIZE_BYTES, isAllowedMimeType, sanitizeStorageKey } from "@/lib/file-policy";
import { sanitizeFilename } from "@/lib/utils";

export async function uploadFile(formData: FormData): Promise<{ success: boolean; error?: string; fileId?: string }> {
  try {
    const token = await getSessionCookie();

    if (!token) {
      return { success: false, error: "Please log in to upload files" };
    }

    let payload;
    try {
      payload = await verifySessionToken(token);
    } catch {
      return { success: false, error: "Your session has expired" };
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { success: false, error: "Please select a valid file" };
    }

    if (file.size <= 0 || file.size > MAX_UPLOAD_SIZE_BYTES) {
      return { success: false, error: "File size exceeds the allowed limit" };
    }

    if (!isAllowedMimeType(file.type)) {
      return { success: false, error: "This file type is not allowed" };
    }

    const originalName = sanitizeFilename(file.name || "untitled-file");
    const key = `uploads/${payload.userId}/${randomUUID()}-${sanitizeStorageKey(originalName)}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await storageProvider.upload({
      key,
      buffer,
      contentType: file.type || "application/octet-stream",
      metadata: {
        originalName,
        ownerId: payload.userId,
      },
    });

    const created = await prisma.file.create({
      data: {
        ownerId: payload.userId,
        originalName,
        storageKey: key,
        fileSizeBytes: file.size,
        mimeType: file.type || "application/octet-stream",
        status: "READY",
        visibility: "PUBLIC",
      },
    });

    revalidatePath("/dashboard");

    return { success: true, fileId: created.id };
  } catch (error: any) {
    console.error("SERVER UPLOAD ERROR:", error);
    return {
      success: false,
      error: error?.message || "Lỗi không xác định khi upload",
    };
  }
}

export async function getUserFiles() {
  const token = await getSessionCookie();
  if (!token) return [];

  try {
    const payload = await verifySessionToken(token);
    return prisma.file.findMany({
      where: { ownerId: payload.userId },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}
