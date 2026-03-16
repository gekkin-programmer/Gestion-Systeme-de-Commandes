import { z } from 'zod';
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const RegisterAdminSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    restaurantId: z.ZodString;
    role: z.ZodEnum<["ADMIN", "STAFF"]>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    restaurantId: string;
    role: "ADMIN" | "STAFF";
}, {
    email: string;
    password: string;
    restaurantId: string;
    role: "ADMIN" | "STAFF";
}>;
export declare const CreateRestaurantSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    currency: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    slug: string;
    currency: string;
    address?: string | undefined;
    city?: string | undefined;
}, {
    name: string;
    slug: string;
    address?: string | undefined;
    city?: string | undefined;
    currency?: string | undefined;
}>;
export declare const UpdateRestaurantSettingsSchema: z.ZodObject<{
    mtnMoneyNumber: z.ZodOptional<z.ZodString>;
    orangeMoneyNumber: z.ZodOptional<z.ZodString>;
    enableMtnMoney: z.ZodOptional<z.ZodBoolean>;
    enableOrangeMoney: z.ZodOptional<z.ZodBoolean>;
    enableCash: z.ZodOptional<z.ZodBoolean>;
    taxRate: z.ZodOptional<z.ZodNumber>;
    themePreset: z.ZodOptional<z.ZodEnum<["DARK_GOLD", "WHITE_PURPLE", "WHITE_RED"]>>;
}, "strip", z.ZodTypeAny, {
    mtnMoneyNumber?: string | undefined;
    orangeMoneyNumber?: string | undefined;
    enableMtnMoney?: boolean | undefined;
    enableOrangeMoney?: boolean | undefined;
    enableCash?: boolean | undefined;
    taxRate?: number | undefined;
    themePreset?: "DARK_GOLD" | "WHITE_PURPLE" | "WHITE_RED" | undefined;
}, {
    mtnMoneyNumber?: string | undefined;
    orangeMoneyNumber?: string | undefined;
    enableMtnMoney?: boolean | undefined;
    enableOrangeMoney?: boolean | undefined;
    enableCash?: boolean | undefined;
    taxRate?: number | undefined;
    themePreset?: "DARK_GOLD" | "WHITE_PURPLE" | "WHITE_RED" | undefined;
}>;
export declare const CreateCategorySchema: z.ZodObject<{
    nameFr: z.ZodString;
    nameEn: z.ZodString;
    sortOrder: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    nameFr: string;
    nameEn: string;
    sortOrder: number;
}, {
    nameFr: string;
    nameEn: string;
    sortOrder?: number | undefined;
}>;
export declare const CreateMenuItemSchema: z.ZodObject<{
    categoryId: z.ZodString;
    nameFr: z.ZodString;
    nameEn: z.ZodString;
    descriptionFr: z.ZodOptional<z.ZodString>;
    descriptionEn: z.ZodOptional<z.ZodString>;
    price: z.ZodNumber;
    isAvailable: z.ZodDefault<z.ZodBoolean>;
    isPopular: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    nameFr: string;
    nameEn: string;
    categoryId: string;
    price: number;
    isAvailable: boolean;
    isPopular: boolean;
    descriptionFr?: string | undefined;
    descriptionEn?: string | undefined;
}, {
    nameFr: string;
    nameEn: string;
    categoryId: string;
    price: number;
    descriptionFr?: string | undefined;
    descriptionEn?: string | undefined;
    isAvailable?: boolean | undefined;
    isPopular?: boolean | undefined;
}>;
export declare const UpdateMenuItemSchema: z.ZodObject<{
    categoryId: z.ZodOptional<z.ZodString>;
    nameFr: z.ZodOptional<z.ZodString>;
    nameEn: z.ZodOptional<z.ZodString>;
    descriptionFr: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    descriptionEn: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    price: z.ZodOptional<z.ZodNumber>;
    isAvailable: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    isPopular: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    nameFr?: string | undefined;
    nameEn?: string | undefined;
    categoryId?: string | undefined;
    descriptionFr?: string | undefined;
    descriptionEn?: string | undefined;
    price?: number | undefined;
    isAvailable?: boolean | undefined;
    isPopular?: boolean | undefined;
}, {
    nameFr?: string | undefined;
    nameEn?: string | undefined;
    categoryId?: string | undefined;
    descriptionFr?: string | undefined;
    descriptionEn?: string | undefined;
    price?: number | undefined;
    isAvailable?: boolean | undefined;
    isPopular?: boolean | undefined;
}>;
export declare const CreateTableSchema: z.ZodObject<{
    number: z.ZodNumber;
    label: z.ZodString;
    capacity: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    number: number;
    label: string;
    capacity: number;
}, {
    number: number;
    label: string;
    capacity?: number | undefined;
}>;
export declare const StartSessionSchema: z.ZodObject<{
    tableToken: z.ZodString;
    customerPhone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tableToken: string;
    customerPhone?: string | undefined;
}, {
    tableToken: string;
    customerPhone?: string | undefined;
}>;
export declare const CreateOrderItemSchema: z.ZodObject<{
    menuItemId: z.ZodString;
    quantity: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    menuItemId: string;
    quantity: number;
}, {
    menuItemId: string;
    quantity: number;
}>;
export declare const CreateOrderSchema: z.ZodObject<{
    sessionToken: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        menuItemId: z.ZodString;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        menuItemId: string;
        quantity: number;
    }, {
        menuItemId: string;
        quantity: number;
    }>, "many">;
    notes: z.ZodOptional<z.ZodString>;
    customerPhone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    sessionToken: string;
    items: {
        menuItemId: string;
        quantity: number;
    }[];
    customerPhone?: string | undefined;
    notes?: string | undefined;
}, {
    sessionToken: string;
    items: {
        menuItemId: string;
        quantity: number;
    }[];
    customerPhone?: string | undefined;
    notes?: string | undefined;
}>;
export declare const UpdateOrderStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["CONFIRMED", "PREPARING", "READY", "SERVED", "CANCELLED"]>;
}, "strip", z.ZodTypeAny, {
    status: "CONFIRMED" | "PREPARING" | "READY" | "SERVED" | "CANCELLED";
}, {
    status: "CONFIRMED" | "PREPARING" | "READY" | "SERVED" | "CANCELLED";
}>;
export declare const InitiatePaymentSchema: z.ZodObject<{
    orderId: z.ZodString;
    method: z.ZodEnum<["CASH", "MTN_MOBILE_MONEY", "ORANGE_MONEY"]>;
    mobileMoneyPhone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    orderId: string;
    method: "CASH" | "MTN_MOBILE_MONEY" | "ORANGE_MONEY";
    mobileMoneyPhone?: string | undefined;
}, {
    orderId: string;
    method: "CASH" | "MTN_MOBILE_MONEY" | "ORANGE_MONEY";
    mobileMoneyPhone?: string | undefined;
}>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateRestaurantInput = z.infer<typeof CreateRestaurantSchema>;
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type CreateMenuItemInput = z.infer<typeof CreateMenuItemSchema>;
export type CreateTableInput = z.infer<typeof CreateTableSchema>;
export type StartSessionInput = z.infer<typeof StartSessionSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type InitiatePaymentInput = z.infer<typeof InitiatePaymentSchema>;
//# sourceMappingURL=validators.d.ts.map