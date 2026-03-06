import { z } from 'zod';
import { PAYMENT_METHOD, ROLES } from './constants';

// ─── Auth ────────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  restaurantId: z.string().uuid(),
  role: z.enum([ROLES.ADMIN, ROLES.STAFF]),
});

// ─── Restaurant ───────────────────────────────────────────────────────────────

export const CreateRestaurantSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  address: z.string().optional(),
  city: z.string().optional(),
  currency: z.string().default('XAF'),
});

export const UpdateRestaurantSettingsSchema = z.object({
  mtnMoneyNumber: z.string().optional(),
  orangeMoneyNumber: z.string().optional(),
  enableMtnMoney: z.boolean().optional(),
  enableOrangeMoney: z.boolean().optional(),
  enableCash: z.boolean().optional(),
  taxRate: z.number().min(0).max(1).optional(),
  themePreset: z.enum(['DARK_GOLD', 'WHITE_PURPLE', 'WHITE_RED']).optional(),
});

// ─── Category ────────────────────────────────────────────────────────────────

export const CreateCategorySchema = z.object({
  nameFr: z.string().min(1).max(100),
  nameEn: z.string().min(1).max(100),
  sortOrder: z.number().int().min(0).default(0),
});

// ─── MenuItem ────────────────────────────────────────────────────────────────

export const CreateMenuItemSchema = z.object({
  categoryId: z.string().uuid(),
  nameFr: z.string().min(1).max(200),
  nameEn: z.string().min(1).max(200),
  descriptionFr: z.string().max(500).optional(),
  descriptionEn: z.string().max(500).optional(),
  price: z.number().positive(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isAvailable: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  chefName: z.string().max(100).optional(),
  cookingTimeMin: z.number().int().positive().optional(),
  calories: z.number().int().positive().optional(),
  servings: z.number().int().positive().optional(),
});

export const UpdateMenuItemSchema = CreateMenuItemSchema.partial();

// ─── Table ───────────────────────────────────────────────────────────────────

export const CreateTableSchema = z.object({
  number: z.number().int().positive(),
  label: z.string().min(1).max(50),
  capacity: z.number().int().positive().default(4),
});

// ─── Session ─────────────────────────────────────────────────────────────────

export const StartSessionSchema = z.object({
  tableToken: z.string().uuid(),
  customerPhone: z.string().optional(),
});

// ─── Order ───────────────────────────────────────────────────────────────────

export const CreateOrderItemSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const CreateOrderSchema = z.object({
  sessionToken: z.string().uuid(),
  items: z.array(CreateOrderItemSchema).min(1),
  notes: z.string().max(500).optional(),
  customerPhone: z.string().optional(),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED']),
});

// ─── Payment ─────────────────────────────────────────────────────────────────

export const InitiatePaymentSchema = z.object({
  orderId: z.string().uuid(),
  method: z.enum([
    PAYMENT_METHOD.CASH,
    PAYMENT_METHOD.MTN_MOBILE_MONEY,
    PAYMENT_METHOD.ORANGE_MONEY,
  ]),
  mobileMoneyPhone: z.string().optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateRestaurantInput = z.infer<typeof CreateRestaurantSchema>;
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type CreateMenuItemInput = z.infer<typeof CreateMenuItemSchema>;
export type CreateTableInput = z.infer<typeof CreateTableSchema>;
export type StartSessionInput = z.infer<typeof StartSessionSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type InitiatePaymentInput = z.infer<typeof InitiatePaymentSchema>;
