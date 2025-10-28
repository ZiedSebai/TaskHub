export interface User {
  id: string;
  email: string;
  role?: string;
}

export interface Project {
  _id: string;
  id: string;
  name: string;
  description?: string;
  creatorId: string;
  members: Array<{ userId: string; role: string }>;
}

export interface Task {
  _id: string;
  id: string;
  title: string;
  description?: string;
  status: string;
  order: number;
  projectId: string;
  assignedTo?: string;
  dueDate?: string;
}

export interface BoardColumn {
  _id: string;
  id: string;
  name: string;
  tasks: Task[];
}

export interface Board {
  name: string;
  columns: BoardColumn[];
  members: Array<{ userId: string; user: User; role: string }>;
}

export interface AuthResponse {
  token: string;
  user: User;
}

