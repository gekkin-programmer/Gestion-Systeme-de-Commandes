"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitiatePaymentSchema = exports.UpdateOrderStatusSchema = exports.CreateOrderSchema = exports.CreateOrderItemSchema = exports.StartSessionSchema = exports.CreateTableSchema = exports.UpdateMenuItemSchema = exports.CreateMenuItemSchema = exports.CreateCategorySchema = exports.UpdateRestaurantSettingsSchema = exports.CreateRestaurantSchema = exports.RegisterAdminSchema = exports.LoginSchema = void 0;
const zod_1 = require("zod");
const constants_1 = require("./constants");
// ─── Auth ────────────────────────────────────────────────────────────────────
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
exports.RegisterAdminSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    restaurantId: zod_1.z.string().uuid(),
    role: zod_1.z.enum([constants_1.ROLES.ADMIN, constants_1.ROLES.STAFF]),
});
// ─── Restaurant ───────────────────────────────────────────────────────────────
exports.CreateRestaurantSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    slug: zod_1.z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
    address: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    currency: zod_1.z.string().default('XAF'),
});
exports.UpdateRestaurantSettingsSchema = zod_1.z.object({
    mtnMoneyNumber: zod_1.z.string().optional(),
    orangeMoneyNumber: zod_1.z.string().optional(),
    enableMtnMoney: zod_1.z.boolean().optional(),
    enableOrangeMoney: zod_1.z.boolean().optional(),
    enableCash: zod_1.z.boolean().optional(),
    taxRate: zod_1.z.number().min(0).max(1).optional(),
    themePreset: zod_1.z.enum(['DARK_GOLD', 'WHITE_PURPLE', 'WHITE_RED']).optional(),
});
// ─── Category ────────────────────────────────────────────────────────────────
exports.CreateCategorySchema = zod_1.z.object({
    nameFr: zod_1.z.string().min(1).max(100),
    nameEn: zod_1.z.string().min(1).max(100),
    sortOrder: zod_1.z.number().int().min(0).default(0),
});
// ─── MenuItem ────────────────────────────────────────────────────────────────
exports.CreateMenuItemSchema = zod_1.z.object({
    categoryId: zod_1.z.string().uuid(),
    nameFr: zod_1.z.string().min(1).max(200),
    nameEn: zod_1.z.string().min(1).max(200),
    descriptionFr: zod_1.z.string().max(500).optional(),
    descriptionEn: zod_1.z.string().max(500).optional(),
    price: zod_1.z.number().positive(),
    isAvailable: zod_1.z.boolean().default(true),
    isPopular: zod_1.z.boolean().default(false),
});
exports.UpdateMenuItemSchema = exports.CreateMenuItemSchema.partial();
// ─── Table ───────────────────────────────────────────────────────────────────
exports.CreateTableSchema = zod_1.z.object({
    number: zod_1.z.number().int().positive(),
    label: zod_1.z.string().min(1).max(50),
    capacity: zod_1.z.number().int().positive().default(4),
});
// ─── Session ─────────────────────────────────────────────────────────────────
exports.StartSessionSchema = zod_1.z.object({
    tableToken: zod_1.z.string().uuid(),
    customerPhone: zod_1.z.string().optional(),
});
// ─── Order ───────────────────────────────────────────────────────────────────
exports.CreateOrderItemSchema = zod_1.z.object({
    menuItemId: zod_1.z.string().uuid(),
    quantity: zod_1.z.number().int().positive(),
});
exports.CreateOrderSchema = zod_1.z.object({
    sessionToken: zod_1.z.string().uuid(),
    items: zod_1.z.array(exports.CreateOrderItemSchema).min(1),
    notes: zod_1.z.string().max(500).optional(),
    customerPhone: zod_1.z.string().optional(),
});
exports.UpdateOrderStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED']),
});
// ─── Payment ─────────────────────────────────────────────────────────────────
exports.InitiatePaymentSchema = zod_1.z.object({
    orderId: zod_1.z.string().uuid(),
    method: zod_1.z.enum([
        constants_1.PAYMENT_METHOD.CASH,
        constants_1.PAYMENT_METHOD.MTN_MOBILE_MONEY,
        constants_1.PAYMENT_METHOD.ORANGE_MONEY,
    ]),
    mobileMoneyPhone: zod_1.z.string().optional(),
});
//# sourceMappingURL=validators.js.map