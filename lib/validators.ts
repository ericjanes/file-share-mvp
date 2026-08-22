import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  referralCode: z.string().trim().max(32).optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

export const fileUploadSchema = z.object({
  name: z.string().trim().min(1).max(255),
  mimeType: z.string().min(1).max(200),
  size: z.number().int().positive().max(100 * 1024 * 1024),
});

export const withdrawalRequestSchema = z.object({
  amount: z.number().positive().max(1000000),
  method: z.string().trim().min(2).max(60),
  accountInfo: z.string().trim().min(4).max(500),
});
