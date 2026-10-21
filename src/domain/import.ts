import { MAX_TITLE_LENGTH, STATUSES, type Status } from "./tasks";

export interface ImportedTask {
  title: string;
  status: Status;
}

// Validates the whole payload and fails on the first bad record, so the user
// sees exactly which entry is wrong instead of getting a partial import.
export function parseTaskList(data: unknown): ImportedTask[] {
  if (!Array.isArray(data)) {
    throw new Error("Ожидался список задач");
  }

  return data.map((item, index) => {
    const position = index + 1;

    if (typeof item !== "object" || item === null) {
      throw new Error(`Запись ${position}: неверный формат`);
    }

    const { title, status = "todo" } = item as Record<string, unknown>;

    if (typeof title !== "string" || title.trim() === "" || title.trim().length > MAX_TITLE_LENGTH) {
      throw new Error(`Запись ${position}: некорректное название`);
    }
    if (typeof status !== "string" || !(STATUSES as readonly string[]).includes(status)) {
      throw new Error(`Запись ${position}: неизвестный статус`);
    }

    return { title: title.trim(), status: status as Status };
  });
}

export async function fetchTaskList(url: string, fetcher: typeof fetch = fetch): Promise<ImportedTask[]> {
  let response: Response;
  try {
    response = await fetcher(url);
  } catch {
    throw new Error("Не удалось подключиться к серверу");
  }

  if (!response.ok) {
    throw new Error(`Сервер ответил ошибкой ${response.status}`);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error("Ответ сервера не является JSON");
  }

  return parseTaskList(data);
}
