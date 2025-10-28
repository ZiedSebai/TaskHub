import { apiClient } from './client';
import type { AuthResponse, User } from '../types';

export const authApi = {
  signup: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/signup', { name, email, password });
    return data;
  },
  
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },
};

