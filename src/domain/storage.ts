import { STATUSES, type Task } from "./tasks";

export const STORAGE_KEY = "kanban.tasks.v1";

type Reader = Pick<Storage, "getItem">;
type Writer = Pick<Storage, "setItem">;

function isTask(value: unknown): value is Task {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.status === "string" &&
    (STATUSES as readonly string[]).includes(candidate.status)
  );
}

// Corrupted or hand-edited data is dropped entry by entry instead of
// failing the whole board, so one bad record cannot wipe out the rest.
export function parseTasks(raw: string | null): Task[] {
  if (raw === null) return [];

  try {
    const data: unknown = JSON.parse(raw);
    return Array.isArray(data) ? data.filter(isTask) : [];
  } catch {
    return [];
  }
}

export function loadTasks(storage: Reader): Task[] {
  try {
    return parseTasks(storage.getItem(STORAGE_KEY));
  } catch {
    // Storage can throw when access is blocked (e.g. some privacy modes).
    return [];
  }
}

export function saveTasks(storage: Writer, tasks: Task[]): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
