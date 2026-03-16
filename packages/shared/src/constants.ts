export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  SERVED: 'SERVED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const PAYMENT_STATUS = {
  UNPAID: 'UNPAID',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_METHOD = {
  CASH: 'CASH',
  MTN_MOBILE_MONEY: 'MTN_MOBILE_MONEY',
  ORANGE_MONEY: 'ORANGE_MONEY',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const TABLE_STATUS = {
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
  RESERVED: 'RESERVED',
  MAINTENANCE: 'MAINTENANCE',
} as const;

export type TableStatus = (typeof TABLE_STATUS)[keyof typeof TABLE_STATUS];

export const SOCKET_EVENTS = {
  // Server → Client
  ORDER_NEW: 'order:new',
  ORDER_STATUS_CHANGED: 'order:status_changed',
  ORDER_CANCELLED: 'order:cancelled',
  PAYMENT_STATUS_CHANGED: 'payment:status_changed',
  MENU_ITEM_AVAILABILITY_CHANGED: 'menu:item_availability_changed',
  SESSION_CLOSED: 'session:closed',
  TABLE_STATUS_CHANGED: 'table:status_changed',
  // Client → Server
  JOIN_RESTAURANT: 'join:restaurant',
  JOIN_SESSION: 'join:session',
} as const;

export const DEFAULT_CURRENCY = 'XAF';
export const TABLE_SESSION_TTL_HOURS = 4;
export const ORDER_NUMBER_PREFIX = 'CMD';
