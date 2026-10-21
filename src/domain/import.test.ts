import { describe, expect, it, vi } from "vitest";
import { fetchTaskList, parseTaskList } from "./import";
import { MAX_TITLE_LENGTH } from "./tasks";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("parseTaskList", () => {
  it("trims titles and defaults the status to todo", () => {
    expect(parseTaskList([{ title: "  Купить хлеб  " }])).toEqual([
      { title: "Купить хлеб", status: "todo" },
    ]);
  });

  it("keeps a valid status", () => {
    expect(parseTaskList([{ title: "Ревью", status: "done" }])).toEqual([
      { title: "Ревью", status: "done" },
    ]);
  });

  it("returns an empty list for an empty array", () => {
    expect(parseTaskList([])).toEqual([]);
  });

  it("rejects a payload that is not an array", () => {
    expect(() => parseTaskList({ title: "one" })).toThrow("Ожидался список задач");
  });

  it("rejects a record that is not an object", () => {
    expect(() => parseTaskList(["text"])).toThrow("Запись 1: неверный формат");
  });

  it("rejects a missing or blank title and names the record", () => {
    expect(() => parseTaskList([{ title: "ok" }, { title: "   " }])).toThrow("Запись 2: некорректное название");
    expect(() => parseTaskList([{ status: "todo" }])).toThrow("Запись 1: некорректное название");
  });

  it("rejects a title longer than the maximum", () => {
    const title = "a".repeat(MAX_TITLE_LENGTH + 1);
    expect(() => parseTaskList([{ title }])).toThrow("некорректное название");
  });

  it("rejects an unknown status", () => {
    expect(() => parseTaskList([{ title: "x", status: "archived" }])).toThrow("Запись 1: неизвестный статус");
  });
});

describe("fetchTaskList", () => {
  it("returns parsed tasks for a successful JSON response", async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse([{ title: "Из сети", status: "in-progress" }]));
    await expect(fetchTaskList("/tasks.json", fetcher)).resolves.toEqual([
      { title: "Из сети", status: "in-progress" },
    ]);
    expect(fetcher).toHaveBeenCalledWith("/tasks.json");
  });

  it("reports a network failure", async () => {
    const fetcher = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(fetchTaskList("/tasks.json", fetcher)).rejects.toThrow("Не удалось подключиться к серверу");
  });

  it("reports an HTTP error status", async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse({}, 500));
    await expect(fetchTaskList("/tasks.json", fetcher)).rejects.toThrow("Сервер ответил ошибкой 500");
  });

  it("reports a body that is not JSON", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response("<html>", { status: 200 }));
    await expect(fetchTaskList("/tasks.json", fetcher)).rejects.toThrow("не является JSON");
  });

  it("passes validation errors through", async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse([{ title: "" }]));
    await expect(fetchTaskList("/tasks.json", fetcher)).rejects.toThrow("Запись 1");
  });
});
