import type { Request, Response } from 'express';
import crypto from 'crypto';
import { LoginSchema } from '@repo/shared';
import * as authService from '../services/auth.service';
import { prisma } from '../config/database';
import { env } from '../config/env';

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
        restaurantId: result.user.restaurantId,
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
        restaurantId: result.user.restaurantId,
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
