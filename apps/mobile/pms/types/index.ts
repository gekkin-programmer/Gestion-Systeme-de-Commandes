// Shared TypeScript types for the PMS mobile app

export type UserRole = 'STAFF' | 'ADMIN' | 'SUPER_ADMIN';

export type ServiceType = 'ROOM_SERVICE' | 'HOUSEKEEPING' | 'CONCIERGE' | 'SPA';

export type RequestStatus =
  | 'RECEIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'MTN_MOBILE_MONEY' | 'ORANGE_MONEY' | 'HOTEL_BILL';

export type PaymentStatus =
  | 'UNPAID'
  | 'PENDING_VERIFICATION'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  hotelId: string | null;
  departmentType: ServiceType | null;
}

export interface GuestSession {
  stayToken: string;
  roomId: string;
  hotelId: string;
  roomNumber: number;
  phone: string;
}

// ─── Hotel & Rooms ───────────────────────────────────────────────────────────

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  currency: string;
  settings?: HotelSettings;
}

export interface HotelSettings {
  enableMtnMoney: boolean;
  enableOrangeMoney: boolean;
  enableHotelBill: boolean;
  taxRate: number;
  mtnMoneyNumber?: string;
  orangeMoneyNumber?: string;
}

export interface Room {
  id: string;
  roomNumber: number;
  floor: number;
  type: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  qrCodeUrl?: string;
}

// ─── Services ────────────────────────────────────────────────────────────────

export interface ServiceDepartment {
  id: string;
  type: ServiceType;
  nameFr: string;
  nameEn: string;
  isActive: boolean;
  items: ServiceItem[];
}

export interface ServiceItem {
  id: string;
  departmentId: string;
  nameFr: string;
  nameEn: string;
  descriptionFr?: string;
  descriptionEn?: string;
  price?: number;
  imageUrl?: string;
  isAvailable: boolean;
}

// ─── Requests ────────────────────────────────────────────────────────────────

export interface ServiceRequest {
  id: string;
  requestNumber: string;
  department: ServiceType;
  status: RequestStatus;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  guestPhone?: string;
  createdAt: string;
  updatedAt: string;
  items: ServiceRequestItem[];
  payment?: Payment;
  roomStay?: {
    room: {
      roomNumber: number;
    };
  };
}

export interface ServiceRequestItem {
  id: string;
  quantity: number;
  unitPrice: number;
  itemNameFr: string;
  itemNameEn: string;
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
  serviceItem: ServiceItem;
  quantity: number;
}

// ─── Payments ────────────────────────────────────────────────────────────────

export interface Payment {
  id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  mobileMoneyPhone?: string;
  transactionRef?: string;
  confirmedAt?: string;
}

// ─── API Responses ───────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
