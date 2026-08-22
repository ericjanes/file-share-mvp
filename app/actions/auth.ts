"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  clearSessionCookie,
  createSessionToken,
  getSessionCookie,
  hashPassword,
  hashToken,
  setSessionCookie,
  verifyPassword,
  verifySessionToken,
} from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validators";

function generateReferralCode() {
  return randomBytes(4).toString("hex").toUpperCase().slice(0, 8);
}

async function generateUniqueReferralCode() {
  let code = generateReferralCode();

  while (await prisma.user.findUnique({ where: { referralCode: code } })) {
    code = generateReferralCode();
  }

  return code;
}

export async function registerUser(formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const result = registerSchema.safeParse({
    name: data.name,
    email: data.email,
    password: data.password,
    referralCode: data.referralCode,
  });

  if (!result.success) {
    redirect("/auth/register?error=Please provide valid registration details");
  }

  const { email, password, name, referralCode } = result.data;
  const normalizedEmail = email.toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    redirect("/auth/register?error=An account with this email already exists");
  }

  let referrer = null;
  if (referralCode && referralCode.trim()) {
    const normalizedReferralCode = referralCode.trim().toUpperCase();
    const referralEntity = await prisma.user.findUnique({
      where: { referralCode: normalizedReferralCode },
    });

    if (!referralEntity) {
      redirect("/auth/register?error=Referral code is invalid");
    }

    if (referralEntity.email === normalizedEmail) {
      redirect("/auth/register?error=You cannot refer yourself");
    }

    referrer = referralEntity;
  }

  const referralCodeValue = await generateUniqueReferralCode();
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name: name ?? "New User",
      email: normalizedEmail,
      passwordHash,
      referralCode: referralCodeValue,
      role: "USER",
      status: "ACTIVE",
    },
  });

  await prisma.userBalance.create({
    data: {
      userId: user.id,
      pendingBalance: 0,
      availableBalance: 0,
      lifetimeEarnings: 0,
    },
  });

  if (referrer) {
    await prisma.referral.create({
      data: {
        referrerId: referrer.id,
        referredUserId: user.id,
        status: "ACTIVE",
      },
    });
  }

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  const sessionHash = await hashToken(token);

  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: sessionHash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      userAgent: "server-auth",
    },
  });

  await setSessionCookie(token);
  revalidatePath("/");
  redirect("/dashboard");
}

export async function loginUser(formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const result = loginSchema.safeParse({
    email: data.email,
    password: data.password,
  });

  if (!result.success) {
    redirect("/auth/login?error=Please provide a valid email and password");
  }

  const { email, password } = result.data;
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || !user.passwordHash) {
    redirect("/auth/login?error=Invalid email or password");
  }

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    redirect("/auth/login?error=Invalid email or password");
  }

  if (user.status !== "ACTIVE") {
    redirect("/auth/login?error=This account is not active");
  }

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  const sessionHash = await hashToken(token);

  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: sessionHash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      userAgent: "server-auth",
    },
  });

  await setSessionCookie(token);
  revalidatePath("/");
  redirect("/dashboard");
}

export async function logoutUser() {
  const token = await getSessionCookie();

  if (token) {
    try {
      const payload = await verifySessionToken(token);
      const sessionHash = await hashToken(token);

      await prisma.session.updateMany({
        where: {
          userId: payload.userId,
          tokenHash: sessionHash,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    } catch {
      // ignore invalid token during logout
    }
  }

  await clearSessionCookie();
  revalidatePath("/");
  redirect("/");
}
