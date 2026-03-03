// Re-export shared types and add web-specific ones
export type {
  UserDTO,
  AuthTokensDTO,
  RestaurantDTO,
  RestaurantSettingsDTO,
  CategoryDTO,
  MenuItemDTO,
  MenuDTO,
  TableDTO,
  TableSessionDTO,
  OrderDTO,
  OrderItemDTO,
  PaymentDTO,
  DailyStatsDTO,
  ApiResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
} from '@repo/shared';

export interface CartItem {
  menuItemId: string;
  nameFr: string;
  nameEn: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
}

export interface SessionInfo {
  sessionToken: string;
  tableNumber: number;
  tableLabel: string;
  restaurantName: string;
  restaurantSlug: string;
  expiresAt: string;
}
