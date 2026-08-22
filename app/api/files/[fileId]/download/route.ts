import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { storageProvider } from "@/lib/storage";
import { processDownloadRevenue } from "@/lib/revenue";

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "anonymous";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await params;
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  if (!file || file.status !== "READY") {
    return NextResponse.json({ error: "File not found or unavailable" }, { status: 404 });
  }

  const ipHash = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const referer = request.headers.get("referer") ?? null;

  const isBotLike = /bot|crawl|spider|headless|slurp|bingpreview|duckduckbot/i.test(userAgent);
  const recentDownloads = await prisma.download.count({
    where: {
      fileId: file.id,
      ipHash,
      createdAt: {
        gte: new Date(Date.now() - 60 * 1000),
      },
    },
  });

  const isValidDownload = !isBotLike && recentDownloads < 3;

  const download = await prisma.download.create({
    data: {
      fileId: file.id,
      userId: null,
      status: isValidDownload ? "VALID" : "BLOCKED",
      isBot: isBotLike,
      isValid: isValidDownload,
      ipHash,
      userAgent,
      referer,
    },
  });

  if (!isValidDownload) {
    return NextResponse.json({ error: "Download rejected as suspicious" }, { status: 429 });
  }

  await prisma.file.update({
    where: { id: file.id },
    data: { downloadCount: { increment: 1 } },
  });

  await processDownloadRevenue({
    file: { id: file.id, ownerId: file.ownerId },
    download: { id: download.id },
  });

  const signedUrl = await storageProvider.getSignedUrl(file.storageKey, 300);
  return NextResponse.redirect(signedUrl);
}
