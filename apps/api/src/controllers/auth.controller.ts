import type { Request, Response } from 'express';
import { LoginSchema } from '@repo/shared';
import * as authService from '../services/auth.service';
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
