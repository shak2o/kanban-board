import { describe, expect, it } from "vitest";
import { STORAGE_KEY, loadTasks, parseTasks, saveTasks } from "./storage";
import type { Task } from "./tasks";

function createMemoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    raw: data,
  };
}

const tasks: Task[] = [{ id: "a", title: "Ship it", status: "done" }];

describe("saveTasks and loadTasks", () => {
  it("round-trips tasks through storage", () => {
    const storage = createMemoryStorage();
    saveTasks(storage, tasks);
    expect(loadTasks(storage)).toEqual(tasks);
  });

  it("returns an empty list when nothing is stored", () => {
    expect(loadTasks(createMemoryStorage())).toEqual([]);
  });

  it("returns an empty list when storage throws", () => {
    const broken = {
      getItem: () => {
        throw new Error("access denied");
      },
    };
    expect(loadTasks(broken)).toEqual([]);
  });
});

describe("parseTasks", () => {
  it("returns an empty list for invalid JSON", () => {
    expect(parseTasks("{not json")).toEqual([]);
  });

  it("returns an empty list when the payload is not an array", () => {
    expect(parseTasks(JSON.stringify({ id: "x" }))).toEqual([]);
  });

  it("drops records with missing fields or unknown status values", () => {
    const raw = JSON.stringify([
      { id: "1", title: "ok", status: "todo" },
      { id: "2", title: "no status" },
      { id: "3", title: "bad status", status: "archived" },
      { id: 4, title: "numeric id", status: "done" },
      null,
      "string",
    ]);
    expect(parseTasks(raw)).toEqual([{ id: "1", title: "ok", status: "todo" }]);
  });

  it("reads the stored value under the documented key", () => {
    const storage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify(tasks),
    });
    expect(loadTasks(storage)).toEqual(tasks);
  });
});
