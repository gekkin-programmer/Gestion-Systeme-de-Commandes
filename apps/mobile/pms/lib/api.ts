import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://72.60.214.93:4000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // for refresh token cookie
});

// ─── Request interceptor: inject access token ─────────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: auto-refresh on 401 ────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const res = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        const newToken = res.data?.data?.accessToken;
        if (newToken) {
          await SecureStore.setItemAsync('accessToken', newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        }
      } catch {
        await SecureStore.deleteItemAsync('accessToken');
      }
    }
    return Promise.reject(error);
  }
);

// ─── Typed helpers ────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  requestGuestOtp: (phone: string, roomNumber: number, hotelSlug: string) =>
    api.post('/auth/guest/request-otp', { phone, roomNumber, hotelSlug }),
  verifyGuestOtp: (phone: string, otp: string, roomNumber: number, hotelSlug: string) =>
    api.post('/auth/guest/verify-otp', { phone, otp, roomNumber, hotelSlug }),
  // Signup flow
  signupRequestOtp: (phone: string, password: string) =>
    api.post('/auth/signup/request-otp', { phone, password }),
  signupVerify: (phone: string, otp: string) =>
    api.post('/auth/signup/verify', { phone, otp }),
};

export const stayApi = {
  startStay: (roomCode: string, guestPhone: string) =>
    api.post('/stays/start', { roomCode: roomCode.toUpperCase(), guestPhone }),
  getStay: (token: string) => api.get(`/stays/${token}`),
};

export const serviceApi = {
  getDepartments: (hotelId: string) => api.get(`/services/${hotelId}/departments`),
  getItems: (hotelId: string, departmentId?: string) =>
    api.get(`/services/${hotelId}/items${departmentId ? `?departmentId=${departmentId}` : ''}`),
  createItem: (hotelId: string, data: object) => api.post(`/services/${hotelId}/items`, data),
  updateItem: (hotelId: string, id: string, data: object) =>
    api.patch(`/services/${hotelId}/items/${id}`, data),
  deleteItem: (hotelId: string, id: string) => api.delete(`/services/${hotelId}/items/${id}`),
};

export const requestApi = {
  create: (data: object) => api.post('/requests', data),
  getStatus: (id: string) => api.get(`/requests/${id}/status`),
  list: (hotelId: string) => api.get(`/requests/hotel/${hotelId}`),
  updateStatus: (id: string, status: string) => api.patch(`/requests/${id}/status`, { status }),
};

export const roomApi = {
  list: (hotelId: string) => api.get(`/rooms/${hotelId}`),
  create: (hotelId: string, data: object) => api.post(`/rooms/${hotelId}`, data),
  update: (hotelId: string, id: string, data: object) =>
    api.patch(`/rooms/${hotelId}/${id}`, data),
  generateQR: (hotelId: string, id: string) => api.post(`/rooms/${hotelId}/${id}/qr`),
};

export const staffApi = {
  list: (hotelId: string) => api.get(`/staff/${hotelId}`),
  update: (hotelId: string, id: string, data: object) =>
    api.patch(`/staff/${hotelId}/${id}`, data),
};

export const hotelApi = {
  get: (hotelId: string) => api.get(`/hotels/${hotelId}`),
  getStats: (hotelId: string) => api.get(`/hotels/${hotelId}/stats`),
};
