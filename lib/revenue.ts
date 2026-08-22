import { prisma } from "@/lib/prisma";

export type RevenueBreakdown = {
  grossRevenue: number;
  uploaderShare: number;
  referralShare: number;
  platformShare: number;
};

async function getSystemSettingValue(key: string, fallback: string) {
  const setting = await prisma.systemSetting.findUnique({
    where: { key },
  });

  if (!setting) {
    return fallback;
  }

  return setting.value;
}

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

export async function getRevenueBreakdown(): Promise<RevenueBreakdown> {
  const platformRate = Number(
    (await getSystemSettingValue("PLATFORM_COMMISSION_RATE", process.env.DEFAULT_PLATFORM_COMMISSION_RATE ?? "0.15")) || "0.15",
  );
  const uploaderRate = Number(
    (await getSystemSettingValue("UPLOADER_SHARE_RATE", process.env.DEFAULT_UPLOADER_SHARE_RATE ?? "0.70")) || "0.70",
  );
  const referralRate = Number(
    (await getSystemSettingValue("REFERRAL_COMMISSION_RATE", process.env.DEFAULT_REFERRAL_COMMISSION_RATE ?? "0.10")) || "0.10",
  );
  const grossRevenue = Number(process.env.DEFAULT_DOWNLOAD_REVENUE_PER_VALID_DOWNLOAD ?? "0.05");

  const totalShareRate = platformRate + uploaderRate + referralRate;
  const effectivePlatformRate = totalShareRate > 0 ? platformRate / totalShareRate : 0;
  const effectiveUploaderRate = totalShareRate > 0 ? uploaderRate / totalShareRate : 0;
  const effectiveReferralRate = totalShareRate > 0 ? referralRate / totalShareRate : 0;

  const platformShare = roundCurrency(grossRevenue * effectivePlatformRate);
  const uploaderShare = roundCurrency(grossRevenue * effectiveUploaderRate);
  const referralShare = roundCurrency(grossRevenue * effectiveReferralRate);

  const delta = roundCurrency(grossRevenue - (platformShare + uploaderShare + referralShare));

  return {
    grossRevenue: roundCurrency(grossRevenue),
    uploaderShare: roundCurrency(uploaderShare + delta),
    referralShare: roundCurrency(referralShare),
    platformShare: roundCurrency(platformShare),
  };
}

async function applyUserBalance(
  userId: string,
  amount: number,
  description: string,
  relatedEntityType: string,
  relatedEntityId: string,
) {
  if (amount <= 0) return;

  await prisma.$transaction(async (tx) => {
    await tx.balanceTransaction.create({
      data: {
        userId,
        type: "CREDIT",
        amount: amount,
        currency: "USD",
        relatedEntityType,
        relatedEntityId,
        description,
        status: "APPROVED",
      },
    });

    await tx.userBalance.upsert({
      where: { userId },
      create: {
        userId,
        pendingBalance: 0,
        availableBalance: amount,
        lifetimeEarnings: amount,
      },
      update: {
        availableBalance: { increment: amount },
        lifetimeEarnings: { increment: amount },
      },
    });
  });
}

export async function processDownloadRevenue({
  file,
  download,
}: {
  file: { id: string; ownerId: string };
  download: { id: string };
}) {
  const breakdown = await getRevenueBreakdown();
  const ownerReferral = await prisma.referral.findFirst({
    where: {
      referredUserId: file.ownerId,
      status: "ACTIVE",
    },
    include: {
      referrer: true,
    },
  });

  const uploaderRevenue = breakdown.uploaderShare;
  const referralRevenue = ownerReferral ? breakdown.referralShare : 0;

  await prisma.revenueEvent.create({
    data: {
      userId: file.ownerId,
      fileId: file.id,
      downloadId: download.id,
      source: "FILE_DOWNLOAD",
      grossRevenue: breakdown.grossRevenue,
      uploaderShare: uploaderRevenue,
      referralShare: 0,
      platformShare: breakdown.platformShare,
      status: "APPROVED",
    },
  });

  if (ownerReferral) {
    await prisma.revenueEvent.create({
      data: {
        userId: ownerReferral.referrerId,
        fileId: file.id,
        downloadId: download.id,
        source: "REFERRAL_COMMISSION",
        grossRevenue: breakdown.referralShare,
        uploaderShare: 0,
        referralShare: breakdown.referralShare,
        platformShare: 0,
        status: "APPROVED",
      },
    });
  }

  await applyUserBalance(
    file.ownerId,
    uploaderRevenue,
    "File download revenue",
    "FILE",
    file.id,
  );

  if (ownerReferral) {
    await applyUserBalance(
      ownerReferral.referrerId,
      referralRevenue,
      "Referral commission",
      "REFERRAL",
      ownerReferral.id,
    );
  }
}
