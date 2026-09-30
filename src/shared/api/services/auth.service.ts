import type { AxiosInstance } from 'axios';
import {
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  UserResponse,
} from '@sharedTypes';

export function createAuthService(client: AxiosInstance) {
  return {
    async login(data: LoginRequest) {
      const response = await client.post<LoginResponse>('/login', data);
      return response.data;
    },

    async currentUser() {
      const response = await client.post<UserResponse>('/user', {});
      return response.data;
    },

    async logout(data: LogoutRequest) {
      const response = await client.post<LogoutResponse>('/logout', data);
      return response.data;
    },
  };
}
