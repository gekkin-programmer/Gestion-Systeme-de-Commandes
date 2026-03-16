"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORDER_NUMBER_PREFIX = exports.TABLE_SESSION_TTL_HOURS = exports.DEFAULT_CURRENCY = exports.SOCKET_EVENTS = exports.TABLE_STATUS = exports.ROLES = exports.PAYMENT_METHOD = exports.PAYMENT_STATUS = exports.ORDER_STATUS = void 0;
exports.ORDER_STATUS = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    PREPARING: 'PREPARING',
    READY: 'READY',
    SERVED: 'SERVED',
    CANCELLED: 'CANCELLED',
};
exports.PAYMENT_STATUS = {
    UNPAID: 'UNPAID',
    PENDING_VERIFICATION: 'PENDING_VERIFICATION',
    PAID: 'PAID',
    FAILED: 'FAILED',
};
exports.PAYMENT_METHOD = {
    CASH: 'CASH',
    MTN_MOBILE_MONEY: 'MTN_MOBILE_MONEY',
    ORANGE_MONEY: 'ORANGE_MONEY',
};
exports.ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    STAFF: 'STAFF',
    CUSTOMER: 'CUSTOMER',
};
exports.TABLE_STATUS = {
    AVAILABLE: 'AVAILABLE',
    OCCUPIED: 'OCCUPIED',
    RESERVED: 'RESERVED',
    MAINTENANCE: 'MAINTENANCE',
};
exports.SOCKET_EVENTS = {
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
};
exports.DEFAULT_CURRENCY = 'XAF';
exports.TABLE_SESSION_TTL_HOURS = 4;
exports.ORDER_NUMBER_PREFIX = 'CMD';
//# sourceMappingURL=constants.js.map