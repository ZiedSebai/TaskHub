import { apiClient } from './client';
import type { Project, Board } from '../types';

export const projectsApi = {
  list: async (): Promise<Project[]> => {
    const { data } = await apiClient.get<Project[]>('/projects');
    return data;
  },
  
  getBoard: async (id: string): Promise<Board> => {
    const { data } = await apiClient.get<Board>(`/projects/${id}/board`);

    // Normalize response to ensure frontend has consistent shape regardless of backend field names
    const DEFAULT_STATUSES = [
      { id: 'backlog', name: 'Backlog' },
      { id: 'in-progress', name: 'In Progress' },
      { id: 'review', name: 'Review' },
      { id: 'done', name: 'Done' },
    ];

    const normalizedColumns = (data.columns || []).map((col: any, idx: number) => {
      const tasks = col.tasks || col.items || col.cards || [];
      const normalizedTasks = (tasks || []).map((t: any) => ({
        ...t,
        id: t.id || t._id,
      }));

      // Ensure column has an id and a name. If name missing, try to map by id to a default status label,
      // otherwise fall back to a friendly generated name.
      const colId = col.id || col._id || DEFAULT_STATUSES[idx]?.id || `col-${idx}`;
      const defaultMatch = DEFAULT_STATUSES.find((ds) => ds.id === colId);
      const colName = col.name || defaultMatch?.name || `Column ${idx + 1}`;

      return {
        ...col,
        id: colId,
        name: colName,
        tasks: normalizedTasks,
      };
    });

    // If the backend returns tasks as a top-level array (instead of nested in columns),
    // distribute them into the normalized columns by matching task.status to column.name or id.
  const topLevelTasks: any[] = (data as any).tasks || (data as any).items || (data as any).cards || [];
    if ((topLevelTasks || []).length > 0 && normalizedColumns.every((c) => (c.tasks || []).length === 0)) {
      const normalizedTopTasks = topLevelTasks.map((t: any) => ({ ...t, id: t.id || t._id }));

      const columnsWithTasks = normalizedColumns.map((col) => ({
        ...col,
        tasks: normalizedTopTasks.filter(
          (t) => (t.status && t.status === col.name) || (t.status && t.status === col.id)
        ),
      }));

      return {
        ...data,
        columns: columnsWithTasks,
      } as Board;
    }

    return {
      ...data,
      columns: normalizedColumns,
    } as Board;
  },
  
  create: async (name: string, description?: string): Promise<Project> => {
    const { data } = await apiClient.post<Project>('/projects', { name, description });
    return data;
  },
  
  addMember: async (projectId: string, userId: string, role: string = 'member'): Promise<any> => {
    const { data } = await apiClient.post(`/projects/${projectId}/members`, { userId, role });
    return data;
  },

  removeMember: async (projectId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/members/${userId}`);
  },
};

