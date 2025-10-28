import { apiClient } from './client';
import type { Task } from '../types';

export const tasksApi = {
  create: async (task: Omit<Task, 'id'>): Promise<Task> => {
    const { data } = await apiClient.post<Task>('/tasks/', task);
    return data;
  },
  
  update: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const { data } = await apiClient.patch<Task>(`/tasks/${id}`, updates);
    return data;
  },
  
  reorder: async (taskOrders: Array<{ taskId: string; status: string; order: number }>): Promise<void> => {
    await apiClient.post('/tasks/reorder', { taskOrders });
  },
  
  // New: move a single task (backend expects projectId, sourceStatus, destStatus, taskId, destIndex)
  reorderMove: async (payload: {
    projectId: string;
    sourceStatus: string;
    destStatus: string;
    taskId: string;
    destIndex: number;
  }): Promise<void> => {
    await apiClient.post('/tasks/reorder', payload);
  },
};

