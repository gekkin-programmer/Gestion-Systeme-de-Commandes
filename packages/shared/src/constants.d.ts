export declare const ORDER_STATUS: {
    readonly PENDING: "PENDING";
    readonly CONFIRMED: "CONFIRMED";
    readonly PREPARING: "PREPARING";
    readonly READY: "READY";
    readonly SERVED: "SERVED";
    readonly CANCELLED: "CANCELLED";
};
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
export declare const PAYMENT_STATUS: {
    readonly UNPAID: "UNPAID";
    readonly PENDING_VERIFICATION: "PENDING_VERIFICATION";
    readonly PAID: "PAID";
    readonly FAILED: "FAILED";
};
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
export declare const PAYMENT_METHOD: {
    readonly CASH: "CASH";
    readonly MTN_MOBILE_MONEY: "MTN_MOBILE_MONEY";
    readonly ORANGE_MONEY: "ORANGE_MONEY";
};
export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];
export declare const ROLES: {
    readonly SUPER_ADMIN: "SUPER_ADMIN";
    readonly ADMIN: "ADMIN";
    readonly STAFF: "STAFF";
    readonly CUSTOMER: "CUSTOMER";
};
export type Role = (typeof ROLES)[keyof typeof ROLES];
export declare const TABLE_STATUS: {
    readonly AVAILABLE: "AVAILABLE";
    readonly OCCUPIED: "OCCUPIED";
    readonly RESERVED: "RESERVED";
    readonly MAINTENANCE: "MAINTENANCE";
};
export type TableStatus = (typeof TABLE_STATUS)[keyof typeof TABLE_STATUS];
export declare const SOCKET_EVENTS: {
    readonly ORDER_NEW: "order:new";
    readonly ORDER_STATUS_CHANGED: "order:status_changed";
    readonly ORDER_CANCELLED: "order:cancelled";
    readonly PAYMENT_STATUS_CHANGED: "payment:status_changed";
    readonly MENU_ITEM_AVAILABILITY_CHANGED: "menu:item_availability_changed";
    readonly SESSION_CLOSED: "session:closed";
    readonly TABLE_STATUS_CHANGED: "table:status_changed";
    readonly JOIN_RESTAURANT: "join:restaurant";
    readonly JOIN_SESSION: "join:session";
};
export declare const DEFAULT_CURRENCY = "XAF";
export declare const TABLE_SESSION_TTL_HOURS = 4;
export declare const ORDER_NUMBER_PREFIX = "CMD";
//# sourceMappingURL=constants.d.ts.map