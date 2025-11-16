export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignee?: string;
  dueDate?: string;
  tags?: string[];
  createdAt: string;
}

export interface Column {
  id: Status;
  title: string;
  tasks: Task[];
}
