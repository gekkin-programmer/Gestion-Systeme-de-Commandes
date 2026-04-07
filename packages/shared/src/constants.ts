export const REQUEST_STATUS = {
  RECEIVED: 'RECEIVED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export type RequestStatus = (typeof REQUEST_STATUS)[keyof typeof REQUEST_STATUS];

export const SERVICE_TYPE = {
  ROOM_SERVICE: 'ROOM_SERVICE',
  HOUSEKEEPING: 'HOUSEKEEPING',
  CONCIERGE: 'CONCIERGE',
  SPA: 'SPA',
} as const;

export type ServiceType = (typeof SERVICE_TYPE)[keyof typeof SERVICE_TYPE];

export const ROOM_STATUS = {
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
  MAINTENANCE: 'MAINTENANCE',
} as const;

export type RoomStatus = (typeof ROOM_STATUS)[keyof typeof ROOM_STATUS];

export const ROOM_TYPE = {
  SINGLE: 'SINGLE',
  DOUBLE: 'DOUBLE',
  SUITE: 'SUITE',
  DELUXE: 'DELUXE',
  PENTHOUSE: 'PENTHOUSE',
} as const;

export type RoomType = (typeof ROOM_TYPE)[keyof typeof ROOM_TYPE];

export const PAYMENT_STATUS = {
  UNPAID: 'UNPAID',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_METHOD = {
  MTN_MOBILE_MONEY: 'MTN_MOBILE_MONEY',
  ORANGE_MONEY: 'ORANGE_MONEY',
  HOTEL_BILL: 'HOTEL_BILL',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const SOCKET_EVENTS = {
  // Server → Client
  REQUEST_NEW: 'request:new',
  REQUEST_STATUS_CHANGED: 'request:status_changed',
  REQUEST_CANCELLED: 'request:cancelled',
  PAYMENT_STATUS_CHANGED: 'payment:status_changed',
  SERVICE_ITEM_AVAILABILITY_CHANGED: 'service:item_availability_changed',
  ROOM_STATUS_CHANGED: 'room:status_changed',
  STAY_CLOSED: 'stay:closed',
  // Client → Server
  JOIN_HOTEL: 'join:hotel',
  JOIN_DEPARTMENT: 'join:department',
  JOIN_STAY: 'join:stay',
} as const;

export const DEFAULT_CURRENCY = 'XAF';
export const REQUEST_NUMBER_PREFIX = 'REQ';
export const ROOM_CODE_LENGTH = 6;
