import type { PaymentMethod, PaymentStatus, Role, RoomStatus, RoomType, ServiceType, RequestStatus } from './constants';

// ─── User ────────────────────────────────────────────────────────────────────

export interface UserDTO {
  id: string;
  email: string;
  role: Role;
  hotelId: string | null;
  departmentType: ServiceType | null;
  createdAt: string;
}

export interface AuthTokensDTO {
  accessToken: string;
  user: UserDTO;
}

// ─── Hotel ───────────────────────────────────────────────────────────────────

export interface HotelDTO {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  logoUrl: string | null;
  isActive: boolean;
  currency: string;
  createdAt: string;
}

export type ThemePreset = 'DARK_GOLD' | 'WHITE_PURPLE' | 'WHITE_RED';

export interface ThemeConfig {
  bg:      string;
  surface: string;
  gold:    string;
  cream:   string;
  dim:     string;
  line:    string;
}

export interface HotelSettingsDTO {
  id: string;
  hotelId: string;
  mtnMoneyNumber: string | null;
  orangeMoneyNumber: string | null;
  enableMtnMoney: boolean;
  enableOrangeMoney: boolean;
  enableHotelBill: boolean;
  taxRate: number;
  themePreset: string;
}

// ─── Room ─────────────────────────────────────────────────────────────────────

export interface RoomDTO {
  id: string;
  hotelId: string;
  roomNumber: number;
  roomCode: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  qrCodeUrl: string | null;
}

export interface RoomStayDTO {
  id: string;
  stayToken: string;
  roomId: string;
  guestPhone: string | null;
  isActive: boolean;
  checkInAt: string;
  checkOutAt: string | null;
  room?: RoomDTO;
}

// ─── Service Department ───────────────────────────────────────────────────────

export interface ServiceDepartmentDTO {
  id: string;
  hotelId: string;
  type: ServiceType;
  nameFr: string;
  nameEn: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ServiceItemDTO {
  id: string;
  departmentId: string;
  hotelId: string;
  nameFr: string;
  nameEn: string;
  descriptionFr: string | null;
  descriptionEn: string | null;
  price: number | null;
  imageUrl: string | null;
  isAvailable: boolean;
}

export interface ServiceCatalogDTO {
  hotel: HotelDTO;
  departments: Array<ServiceDepartmentDTO & { items: ServiceItemDTO[] }>;
  theme: ThemePreset;
}

// ─── Service Request ──────────────────────────────────────────────────────────

export interface ServiceRequestItemDTO {
  id: string;
  serviceItemId: string;
  quantity: number;
  unitPrice: number;
  itemNameFr: string;
  itemNameEn: string;
  subtotal: number;
}

export interface ServiceRequestDTO {
  id: string;
  requestNumber: string;
  roomStayId: string;
  hotelId: string;
  department: ServiceType;
  status: RequestStatus;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes: string | null;
  guestPhone: string | null;
  items: ServiceRequestItemDTO[];
  payment: PaymentDTO | null;
  roomStay?: { room: { roomNumber: number; floor: number } } | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export interface PaymentDTO {
  id: string;
  requestId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  mobileMoneyPhone: string | null;
  transactionRef: string | null;
  confirmedAt: string | null;
  createdAt: string;
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export interface HotelDailyStatsDTO {
  date: string;
  totalRequests: number;
  totalRevenue: number;
  averageRequestValue: number;
  cancelledRequests: number;
  byDepartment: DepartmentStatsDTO[];
}

export interface DepartmentStatsDTO {
  department: ServiceType;
  totalRequests: number;
  totalRevenue: number;
}

// ─── API responses ───────────────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
