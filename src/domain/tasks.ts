export const STATUSES = ["todo", "in-progress", "done"] as const;

export type Status = (typeof STATUSES)[number];

export interface Task {
  id: string;
  title: string;
  status: Status;
}

export const MAX_TITLE_LENGTH = 200;

export function addTask(tasks: Task[], title: string, id: string): Task[] {
  const trimmed = title.trim();

  if (trimmed.length === 0) {
    throw new Error("Task title must not be empty");
  }
  if (trimmed.length > MAX_TITLE_LENGTH) {
    throw new Error(`Task title must be at most ${MAX_TITLE_LENGTH} characters`);
  }

  return [...tasks, { id, title: trimmed, status: "todo" }];
}

export function moveTask(tasks: Task[], id: string, status: Status): Task[] {
  return tasks.map((task) => (task.id === id ? { ...task, status } : task));
}

export function removeTask(tasks: Task[], id: string): Task[] {
  return tasks.filter((task) => task.id !== id);
}

export function groupByStatus(tasks: Task[]): Record<Status, Task[]> {
  const groups: Record<Status, Task[]> = { todo: [], "in-progress": [], done: [] };
  for (const task of tasks) {
    groups[task.status].push(task);
  }
  return groups;
}
