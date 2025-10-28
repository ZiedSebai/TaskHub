import { apiClient } from './client';
import type { User } from '../types';

export const usersApi = {
  list: async (): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>('/users');
    return data;
  },

  search: async (query: string): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>(`/users/search?q=${encodeURIComponent(query)}`);
    return data;
  },
};

