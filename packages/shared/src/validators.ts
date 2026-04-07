import { z } from 'zod';
import { PAYMENT_METHOD, ROLES, SERVICE_TYPE, ROOM_TYPE } from './constants';

// ─── Auth ────────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  hotelId: z.string().uuid(),
  role: z.enum([ROLES.ADMIN, ROLES.STAFF]),
  departmentType: z
    .enum([
      SERVICE_TYPE.ROOM_SERVICE,
      SERVICE_TYPE.HOUSEKEEPING,
      SERVICE_TYPE.CONCIERGE,
      SERVICE_TYPE.SPA,
    ])
    .nullable()
    .optional(),
});

// ─── Hotel ────────────────────────────────────────────────────────────────────

export const CreateHotelSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  address: z.string().optional(),
  city: z.string().optional(),
  currency: z.string().default('XAF'),
});

export const UpdateHotelSettingsSchema = z.object({
  mtnMoneyNumber: z.string().optional(),
  orangeMoneyNumber: z.string().optional(),
  enableMtnMoney: z.boolean().optional(),
  enableOrangeMoney: z.boolean().optional(),
  enableHotelBill: z.boolean().optional(),
  taxRate: z.number().min(0).max(1).optional(),
  themePreset: z.enum(['DARK_GOLD', 'WHITE_PURPLE', 'WHITE_RED']).optional(),
});

// ─── Room ─────────────────────────────────────────────────────────────────────

export const CreateRoomSchema = z.object({
  roomNumber: z.number().int().positive(),
  floor: z.number().int().min(0),
  type: z.enum([
    ROOM_TYPE.SINGLE,
    ROOM_TYPE.DOUBLE,
    ROOM_TYPE.SUITE,
    ROOM_TYPE.DELUXE,
    ROOM_TYPE.PENTHOUSE,
  ]),
});

// ─── Stay ─────────────────────────────────────────────────────────────────────

export const StartStaySchema = z.object({
  roomCode: z.string().length(6).toUpperCase(),
  guestPhone: z.string().optional(),
});

// ─── Service Department ───────────────────────────────────────────────────────

export const CreateServiceDepartmentSchema = z.object({
  type: z.enum([
    SERVICE_TYPE.ROOM_SERVICE,
    SERVICE_TYPE.HOUSEKEEPING,
    SERVICE_TYPE.CONCIERGE,
    SERVICE_TYPE.SPA,
  ]),
  nameFr: z.string().min(1).max(100),
  nameEn: z.string().min(1).max(100),
  sortOrder: z.number().int().min(0).default(0),
});

// ─── Service Item ─────────────────────────────────────────────────────────────

export const CreateServiceItemSchema = z.object({
  departmentId: z.string().min(1),
  nameFr: z.string().min(1).max(200),
  nameEn: z.string().min(1).max(200),
  descriptionFr: z.string().max(500).optional(),
  descriptionEn: z.string().max(500).optional(),
  price: z.number().positive().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isAvailable: z.boolean().default(true),
});

export const UpdateServiceItemSchema = CreateServiceItemSchema.partial();

// ─── Service Request ──────────────────────────────────────────────────────────

export const CreateServiceRequestItemSchema = z.object({
  serviceItemId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const CreateServiceRequestSchema = z.object({
  stayToken: z.string().uuid(),
  department: z.enum([
    SERVICE_TYPE.ROOM_SERVICE,
    SERVICE_TYPE.HOUSEKEEPING,
    SERVICE_TYPE.CONCIERGE,
    SERVICE_TYPE.SPA,
  ]),
  items: z.array(CreateServiceRequestItemSchema).min(1),
  notes: z.string().max(500).optional(),
  guestPhone: z.string().optional(),
});

export const UpdateRequestStatusSchema = z.object({
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'DELIVERED', 'CANCELLED']),
});

// ─── Payment ─────────────────────────────────────────────────────────────────

export const InitiatePaymentSchema = z.object({
  requestId: z.string().uuid(),
  method: z.enum([
    PAYMENT_METHOD.MTN_MOBILE_MONEY,
    PAYMENT_METHOD.ORANGE_MONEY,
    PAYMENT_METHOD.HOTEL_BILL,
  ]),
  mobileMoneyPhone: z.string().optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateHotelInput = z.infer<typeof CreateHotelSchema>;
export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;
export type StartStayInput = z.infer<typeof StartStaySchema>;
export type CreateServiceRequestInput = z.infer<typeof CreateServiceRequestSchema>;
export type InitiatePaymentInput = z.infer<typeof InitiatePaymentSchema>;
