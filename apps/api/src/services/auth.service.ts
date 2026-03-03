import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/database';
import { env } from '../config/env';
import type { User } from '@prisma/client';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export function generateAccessToken(user: User): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN as any },
  );
}

export async function generateTokenPair(user: User): Promise<TokenPair> {
  const accessToken = generateAccessToken(user);

  const refreshTokenValue = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      token: refreshTokenValue,
      userId: user.id,
      expiresAt,
    },
  });

  return { accessToken, refreshToken: refreshTokenValue };
}

export async function login(email: string, password: string): Promise<{ tokens: TokenPair; user: User } | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  const tokens = await generateTokenPair(user);
  return { tokens, user };
}

export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; user: User } | null> {
  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) return null;
  if (!stored.user.isActive) return null;

  const accessToken = generateAccessToken(stored.user);
  return { accessToken, user: stored.user };
}

export async function logout(refreshToken: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken },
    data: { revokedAt: new Date() },
  });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
