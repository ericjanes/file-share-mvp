import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@sharevault.dev";
  const adminPassword = "Admin@123456";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
      status: "ACTIVE",
      name: "System Administrator",
      referralCode: "ADMINSV",
    },
    create: {
      email: adminEmail,
      name: "System Administrator",
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "ADMIN",
      status: "ACTIVE",
      referralCode: "ADMINSV",
    },
  });

  await prisma.userBalance.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      availableBalance: 0,
      pendingBalance: 0,
      lifetimeEarnings: 0,
    },
  });

  const systemSettings = [
    { key: "PLATFORM_COMMISSION_RATE", value: "0.15", description: "Platform share percentage for valid downloads" },
    { key: "UPLOADER_SHARE_RATE", value: "0.70", description: "Creator share percentage for valid downloads" },
    { key: "REFERRAL_COMMISSION_RATE", value: "0.10", description: "Referral commission percentage" },
    { key: "DEFAULT_DOWNLOAD_REVENUE_PER_VALID_DOWNLOAD", value: "0.05", description: "Base revenue per valid download" },
    { key: "MIN_WITHDRAWAL_AMOUNT", value: "10.00", description: "Minimum withdrawal amount" },
  ];

  for (const setting of systemSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        description: setting.description,
      },
      create: {
        key: setting.key,
        value: setting.value,
        description: setting.description,
      },
    });
  }

  const creator = await prisma.user.upsert({
    where: { email: "creator@sharevault.dev" },
    update: {},
    create: {
      email: "creator@sharevault.dev",
      name: "Demo Creator",
      passwordHash: await bcrypt.hash("Creator@123456", 12),
      role: "USER",
      status: "ACTIVE",
      referralCode: "CREATOR1",
    },
  });

  const referrer = await prisma.user.upsert({
    where: { email: "referrer@sharevault.dev" },
    update: {},
    create: {
      email: "referrer@sharevault.dev",
      name: "Demo Referrer",
      passwordHash: await bcrypt.hash("Referrer@123456", 12),
      role: "USER",
      status: "ACTIVE",
      referralCode: "REFERRER1",
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@sharevault.dev" },
    update: {},
    create: {
      email: "demo@sharevault.dev",
      name: "Demo User",
      passwordHash: await bcrypt.hash("Demo@123456", 12),
      role: "USER",
      status: "ACTIVE",
      referralCode: "DEMOUSER",
    },
  });

  await prisma.userBalance.upsert({
    where: { userId: creator.id },
    update: {},
    create: {
      userId: creator.id,
      availableBalance: 42.5,
      pendingBalance: 12.5,
      lifetimeEarnings: 55.0,
    },
  });

  await prisma.userBalance.upsert({
    where: { userId: referrer.id },
    update: {},
    create: {
      userId: referrer.id,
      availableBalance: 18.0,
      pendingBalance: 0,
      lifetimeEarnings: 18.0,
    },
  });

  await prisma.userBalance.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      availableBalance: 0,
      pendingBalance: 0,
      lifetimeEarnings: 0,
    },
  });

  const referral = await prisma.referral.upsert({
    where: {
      referrerId_referredUserId: {
        referrerId: referrer.id,
        referredUserId: demoUser.id,
      },
    },
    update: {},
    create: {
      referrerId: referrer.id,
      referredUserId: demoUser.id,
      status: "ACTIVE",
    },
  });

  const file = await prisma.file.upsert({
    where: {
      storageKey: "uploads/demo/seed-product-brief.pdf",
    },
    update: {},
    create: {
      ownerId: creator.id,
      originalName: "product-brief.pdf",
      storageKey: "uploads/demo/seed-product-brief.pdf",
      fileSizeBytes: 2000000,
      mimeType: "application/pdf",
      status: "READY",
      visibility: "PUBLIC",
      downloadCount: 14,
    },
  });

  await prisma.download.upsert({
    where: {
      id: "seed-download-1",
    },
    update: {},
    create: {
      id: "seed-download-1",
      fileId: file.id,
      userId: demoUser.id,
      status: "VALID",
      isBot: false,
      isValid: true,
      ipHash: "seed-demo-ip",
      userAgent: "seed-demo-agent",
    },
  });

  await prisma.revenueEvent.upsert({
    where: {
      id: "seed-revenue-1",
    },
    update: {},
    create: {
      id: "seed-revenue-1",
      userId: creator.id,
      fileId: file.id,
      source: "FILE_DOWNLOAD",
      grossRevenue: 0.05,
      uploaderShare: 0.035,
      referralShare: 0,
      platformShare: 0.015,
      status: "APPROVED",
    },
  });

  await prisma.report.upsert({
    where: {
      id: "seed-report-1",
    },
    update: {},
    create: {
      id: "seed-report-1",
      reporterId: demoUser.id,
      creatorId: creator.id,
      fileId: file.id,
      reason: "Potential copyright issue",
      details: "User reported the uploaded file may contain copyrighted content.",
      status: "OPEN",
    },
  });

  await prisma.withdrawal.upsert({
    where: {
      id: "seed-withdrawal-1",
    },
    update: {},
    create: {
      id: "seed-withdrawal-1",
      userId: creator.id,
      amount: 20,
      method: "BANK_TRANSFER",
      accountInfo: "Demo bank account ending 1234",
      status: "PENDING",
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      entityType: "USER",
      entityId: admin.id,
      action: "ADMIN_ACTION",
      message: "Seeded initial application defaults and admin account",
      metadata: { source: "seed" },
    },
  });

  console.log("Seed completed. Admin login: admin@sharevault.dev / Admin@123456");
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
