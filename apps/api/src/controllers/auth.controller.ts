import type { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { LoginSchema } from '@repo/shared';
import * as authService from '../services/auth.service';
import { sendOtp } from '../services/sms.service';
import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { env } from '../config/env';

// ─── Guest OTP store (in-memory, TTL 5 min) ──────────────────────────────────
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

const COOKIE_NAME = 'refreshToken';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
  path: '/',
};

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = LoginSchema.parse(req.body);
  const result = await authService.login(email, password);

  if (!result) {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
    return;
  }

  res.cookie(COOKIE_NAME, result.tokens.refreshToken, COOKIE_OPTIONS);
  res.json({
    success: true,
    data: {
      accessToken: result.tokens.accessToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        hotelId: result.user.hotelId,
        departmentType: result.user.departmentType,
      },
    },
  });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const refreshToken = req.cookies?.[COOKIE_NAME];
  if (!refreshToken) {
    res.status(401).json({ success: false, error: 'No refresh token' });
    return;
  }

  const result = await authService.refreshAccessToken(refreshToken);
  if (!result) {
    res.clearCookie(COOKIE_NAME);
    res.status(401).json({ success: false, error: 'Invalid or expired refresh token' });
    return;
  }

  res.json({
    success: true,
    data: {
      accessToken: result.accessToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        hotelId: result.user.hotelId,
        departmentType: result.user.departmentType,
      },
    },
  });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const refreshToken = req.cookies?.[COOKIE_NAME];
  if (refreshToken) {
    await authService.logout(refreshToken);
  }
  res.clearCookie(COOKIE_NAME);
  res.json({ success: true, data: null, message: 'Logged out successfully' });
}

export function me(req: Request, res: Response): void {
  res.json({ success: true, data: req.user });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body as { email: string };

  const user = await prisma.user.findFirst({
    where: { email, isActive: true },
  });

  // Always return 200 to prevent email enumeration
  if (!user) {
    res.json({ success: true, data: null, message: 'If this email exists, a reset link has been sent.' });
    return;
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry },
  });

  const resetUrl = `${env.FRONTEND_URL}/fr/reset-password/${resetToken}`;
  console.log(`[PASSWORD RESET] Reset link for ${email}: ${resetUrl}`);

  res.json({ success: true, data: { resetUrl }, message: 'Reset link generated (check server logs)' });
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, newPassword } = req.body as { token: string; newPassword: string };

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
    return;
  }

  const passwordHash = await authService.hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  // Revoke all refresh tokens for security
  await prisma.refreshToken.updateMany({
    where: { userId: user.id },
    data: { revokedAt: new Date() },
  });

  res.json({ success: true, data: null, message: 'Password updated successfully' });
}

// ─── Guest OTP Auth ────────────────────────────────────────────────────────

export async function requestGuestOtp(req: Request, res: Response): Promise<void> {
  const { phone, roomNumber, hotelSlug } = req.body as {
    phone: string;
    roomNumber: number;
    hotelSlug: string;
  };

  if (!phone || !roomNumber || !hotelSlug) {
    res.status(400).json({ success: false, error: 'phone, roomNumber et hotelSlug requis' });
    return;
  }

  const hotel = await prisma.hotel.findUnique({ where: { slug: hotelSlug } });
  if (!hotel || !hotel.isActive) {
    res.status(404).json({ success: false, error: 'Hôtel introuvable' });
    return;
  }

  const room = await prisma.room.findFirst({
    where: { hotelId: hotel.id, roomNumber: Number(roomNumber) },
  });
  if (!room) {
    res.status(404).json({ success: false, error: 'Chambre introuvable' });
    return;
  }

  const activeStay = await prisma.roomStay.findFirst({
    where: { roomId: room.id, isActive: true },
  });
  if (!activeStay) {
    res.status(404).json({ success: false, error: 'Aucun séjour actif pour cette chambre. Contactez la réception.' });
    return;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const key = `${phone}:${roomNumber}:${hotelSlug}`;
  otpStore.set(key, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

  // TODO: Send SMS via provider (Africa's Talking / Twilio)
  console.log(`[GUEST OTP] ${phone} → ${otp}`);

  res.json({
    success: true,
    data: {
      message: 'Code envoyé par SMS',
      ...(env.NODE_ENV !== 'production' && { otp }), // expose in dev only
    },
  });
}

export async function verifyGuestOtp(req: Request, res: Response): Promise<void> {
  const { phone, otp, roomNumber, hotelSlug } = req.body as {
    phone: string;
    otp: string;
    roomNumber: number;
    hotelSlug: string;
  };

  const key = `${phone}:${roomNumber}:${hotelSlug}`;
  const stored = otpStore.get(key);

  if (!stored || stored.otp !== String(otp) || stored.expiresAt < Date.now()) {
    res.status(400).json({ success: false, error: 'Code invalide ou expiré' });
    return;
  }

  otpStore.delete(key);

  const hotel = await prisma.hotel.findUnique({ where: { slug: hotelSlug } });
  const room = await prisma.room.findFirst({
    where: { hotelId: hotel!.id, roomNumber: Number(roomNumber) },
  });
  const stay = await prisma.roomStay.findFirst({
    where: { roomId: room!.id, isActive: true },
  });

  if (!stay) {
    res.status(404).json({ success: false, error: 'Séjour introuvable ou terminé' });
    return;
  }

  res.json({
    success: true,
    data: {
      stayToken: stay.stayToken,
      roomId:    room!.id,
      hotelId:   hotel!.id,
      hotelName: hotel!.name,
      roomNumber: room!.roomNumber,
      floor:     room!.floor,
      phone,
    },
  });
}

// ─── Guest Signup ─────────────────────────────────────────────────────────────

const SIGNUP_OTP_TTL   = 10 * 60;           // 10 min — OTP validity
const SIGNUP_RL_WINDOW = 15 * 60;           // 15 min — rate limit window
const SIGNUP_RL_MAX    = 2;                 // max OTP sends per window per phone

export async function signupRequestOtp(req: Request, res: Response): Promise<void> {
  const { phone, password } = req.body as { phone: string; password: string };

  if (!phone || !password) {
    res.status(400).json({ success: false, error: 'phone et password requis' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ success: false, error: 'Le mot de passe doit faire au moins 6 caractères' });
    return;
  }

  // ── Phone-based rate limit (2 sends / 15 min) ──────────────────────────────
  const rlKey = `signup:rl:${phone}`;
  const count = await redis.incr(rlKey);
  if (count === 1) {
    // First attempt in this window — set the TTL
    await redis.expire(rlKey, SIGNUP_RL_WINDOW);
  }
  if (count > SIGNUP_RL_MAX) {
    const ttl = await redis.ttl(rlKey);
    const minutes = Math.ceil(ttl / 60);
    res.status(429).json({
      success: false,
      error: `Trop de tentatives. Réessayez dans ${minutes} minute${minutes > 1 ? 's' : ''}.`,
      retryAfterSeconds: ttl,
    });
    return;
  }

  // ── Check phone not already registered ────────────────────────────────────
  const existing = await prisma.guestUser.findUnique({ where: { phone } });
  if (existing) {
    res.status(409).json({ success: false, error: 'Ce numéro est déjà associé à un compte.' });
    return;
  }

  // ── Generate OTP & hash password ──────────────────────────────────────────
  const otp          = Math.floor(100000 + Math.random() * 900000).toString();
  const passwordHash = await bcrypt.hash(password, 12);

  // Store pending signup in Redis (OTP + hashed password)
  const pendingKey = `signup:pending:${phone}`;
  await redis.setex(pendingKey, SIGNUP_OTP_TTL, JSON.stringify({ otp, passwordHash }));

  // ── Send SMS ───────────────────────────────────────────────────────────────
  await sendOtp(phone, otp);

  res.json({
    success: true,
    data: {
      message: 'Code envoyé par SMS',
      // Expose OTP in dev so you can test without Twilio
      ...(env.NODE_ENV !== 'production' && { otp }),
    },
  });
}

export async function signupVerify(req: Request, res: Response): Promise<void> {
  const { phone, otp } = req.body as { phone: string; otp: string };

  if (!phone || !otp) {
    res.status(400).json({ success: false, error: 'phone et otp requis' });
    return;
  }

  // ── Load & validate pending signup ────────────────────────────────────────
  const pendingKey = `signup:pending:${phone}`;
  const raw = await redis.get(pendingKey);

  if (!raw) {
    res.status(400).json({ success: false, error: 'Code expiré ou aucune inscription en cours pour ce numéro.' });
    return;
  }

  const { otp: storedOtp, passwordHash } = JSON.parse(raw) as {
    otp: string;
    passwordHash: string;
  };

  if (String(otp) !== storedOtp) {
    res.status(400).json({ success: false, error: 'Code incorrect.' });
    return;
  }

  // ── Create guest user ─────────────────────────────────────────────────────
  // Guard against race condition / double-submit
  const existing = await prisma.guestUser.findUnique({ where: { phone } });
  if (existing) {
    await redis.del(pendingKey);
    res.status(409).json({ success: false, error: 'Ce numéro est déjà associé à un compte.' });
    return;
  }

  const guest = await prisma.guestUser.create({
    data: { phone, passwordHash },
  });

  // Clean up Redis keys
  await redis.del(pendingKey);
  await redis.del(`signup:rl:${phone}`);

  res.status(201).json({
    success: true,
    data: {
      id:    guest.id,
      phone: guest.phone,
    },
    message: 'Compte créé avec succès.',
  });
}
