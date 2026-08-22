"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getSessionCookie, verifySessionToken } from "@/lib/auth";
import { MAX_UPLOAD_SIZE_BYTES, isAllowedMimeType } from "@/lib/file-policy";
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

    const rawUrl = formData.get("url");
    const rawName = formData.get("name");
    const rawSize = formData.get("size");
    const rawMimeType = formData.get("mimeType");

    if (typeof rawUrl !== "string" || !rawUrl) {
      return { success: false, error: "Missing uploaded file URL" };
    }

    if (typeof rawName !== "string" || !rawName) {
      return { success: false, error: "Missing uploaded file name" };
    }

    const sizeInBytes = Number(rawSize ?? 0);
    if (!Number.isFinite(sizeInBytes) || sizeInBytes <= 0 || sizeInBytes > MAX_UPLOAD_SIZE_BYTES) {
      return { success: false, error: "File size exceeds the allowed limit" };
    }

    const mimeType = typeof rawMimeType === "string" && rawMimeType ? rawMimeType : "application/octet-stream";
    if (!isAllowedMimeType(mimeType)) {
      return { success: false, error: "This file type is not allowed" };
    }

    const originalName = sanitizeFilename(rawName);
    const storageKey = decodeURIComponent(new URL(rawUrl).pathname.replace(/^\/+/, ""));

    const created = await prisma.file.create({
      data: {
        ownerId: payload.userId,
        originalName,
        storageKey,
        fileSizeBytes: sizeInBytes,
        mimeType,
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
