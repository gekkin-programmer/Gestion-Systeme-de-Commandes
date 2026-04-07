// Re-export shared types and add web-specific ones
export type {
  UserDTO,
  AuthTokensDTO,
  HotelDTO,
  HotelSettingsDTO,
  RoomDTO,
  RoomStayDTO,
  ServiceDepartmentDTO,
  ServiceItemDTO,
  ServiceCatalogDTO,
  ServiceRequestDTO,
  ServiceRequestItemDTO,
  PaymentDTO,
  HotelDailyStatsDTO,
  DepartmentStatsDTO,
  ApiResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
} from '@repo/shared';

export interface StayInfo {
  stayToken: string;
  roomNumber: number;
  floor: number;
  hotelName: string;
}
