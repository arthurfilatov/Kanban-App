export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
}

export interface ColumnType {
  id: string;
  title: string;
  tasks: Task[];
}
