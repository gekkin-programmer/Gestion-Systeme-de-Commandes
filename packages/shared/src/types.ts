import type { OrderStatus, PaymentMethod, PaymentStatus, Role, TableStatus } from './constants';

// ─── User ────────────────────────────────────────────────────────────────────

export interface UserDTO {
  id: string;
  email: string;
  role: Role;
  restaurantId: string | null;
  createdAt: string;
}

export interface AuthTokensDTO {
  accessToken: string;
  user: UserDTO;
}

// ─── Restaurant ───────────────────────────────────────────────────────────────

export interface RestaurantDTO {
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

export interface RestaurantSettingsDTO {
  id: string;
  restaurantId: string;
  mtnMoneyNumber: string | null;
  orangeMoneyNumber: string | null;
  enableMtnMoney: boolean;
  enableOrangeMoney: boolean;
  enableCash: boolean;
  taxRate: number;
  themePreset: string;
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface CategoryDTO {
  id: string;
  restaurantId: string;
  nameFr: string;
  nameEn: string;
  sortOrder: number;
  isActive: boolean;
}

// ─── MenuItem ────────────────────────────────────────────────────────────────

export interface MenuItemDTO {
  id: string;
  categoryId: string;
  restaurantId: string;
  nameFr: string;
  nameEn: string;
  descriptionFr: string | null;
  descriptionEn: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  isPopular: boolean;
  chefName: string | null;
  cookingTimeMin: number | null;
  calories: number | null;
  servings: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
}

export interface MenuDTO {
  restaurant:  RestaurantDTO;
  categories:  Array<CategoryDTO & { items: MenuItemDTO[] }>;
  theme:       ThemePreset;
}

// ─── Table ───────────────────────────────────────────────────────────────────

export interface TableDTO {
  id: string;
  restaurantId: string;
  number: number;
  label: string;
  capacity: number;
  status: TableStatus;
  qrToken: string;
  qrCodeUrl: string | null;
}

export interface TableSessionDTO {
  id: string;
  tableId: string;
  sessionToken: string;
  customerPhone: string | null;
  isActive: boolean;
  expiresAt: string;
  table: TableDTO;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export interface OrderItemDTO {
  id: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  itemNameFr: string;
  itemNameEn: string;
  subtotal: number;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  tableSessionId: string;
  restaurantId: string;
  status: OrderStatus;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes: string | null;
  customerPhone: string | null;
  items: OrderItemDTO[];
  payment: PaymentDTO | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export interface PaymentDTO {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  mobileMoneyPhone: string | null;
  transactionRef: string | null;
  confirmedAt: string | null;
  createdAt: string;
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export interface DailyStatsDTO {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  cancelledOrders: number;
  topItems: Array<{ name: string; count: number }>;
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
