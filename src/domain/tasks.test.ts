import { describe, expect, it } from "vitest";
import { MAX_TITLE_LENGTH, addTask, groupByStatus, moveTask, removeTask, type Task } from "./tasks";

const base: Task[] = [
  { id: "1", title: "Write tests", status: "todo" },
  { id: "2", title: "Build layout", status: "in-progress" },
];

describe("addTask", () => {
  it("appends a trimmed task to the todo column", () => {
    const result = addTask(base, "  Review PR  ", "3");
    expect(result[2]).toEqual({ id: "3", title: "Review PR", status: "todo" });
  });

  it("does not mutate the original array", () => {
    addTask(base, "Something", "3");
    expect(base).toHaveLength(2);
  });

  it("rejects empty or whitespace-only titles", () => {
    expect(() => addTask(base, "", "3")).toThrow("must not be empty");
    expect(() => addTask(base, "   ", "3")).toThrow("must not be empty");
  });

  it("accepts a title of exactly the maximum length", () => {
    const title = "a".repeat(MAX_TITLE_LENGTH);
    expect(addTask([], title, "1")[0].title).toHaveLength(MAX_TITLE_LENGTH);
  });

  it("rejects a title longer than the maximum", () => {
    const title = "a".repeat(MAX_TITLE_LENGTH + 1);
    expect(() => addTask([], title, "1")).toThrow(`at most ${MAX_TITLE_LENGTH}`);
  });

  it("counts length after trimming", () => {
    const title = `   ${"a".repeat(MAX_TITLE_LENGTH)}   `;
    expect(addTask([], title, "1")[0].title).toHaveLength(MAX_TITLE_LENGTH);
  });
});

describe("moveTask", () => {
  it("changes the status of the matching task only", () => {
    const result = moveTask(base, "1", "done");
    expect(result.find((t) => t.id === "1")?.status).toBe("done");
    expect(result.find((t) => t.id === "2")).toEqual(base[1]);
  });

  it("returns an equal list when the id is unknown", () => {
    expect(moveTask(base, "missing", "done")).toEqual(base);
  });
});

describe("removeTask", () => {
  it("removes the task with the given id", () => {
    expect(removeTask(base, "1").map((t) => t.id)).toEqual(["2"]);
  });

  it("keeps the list unchanged when the id is unknown", () => {
    expect(removeTask(base, "missing")).toEqual(base);
  });
});

describe("groupByStatus", () => {
  it("places every task into its column and keeps all three columns", () => {
    const groups = groupByStatus(base);
    expect(groups.todo.map((t) => t.id)).toEqual(["1"]);
    expect(groups["in-progress"].map((t) => t.id)).toEqual(["2"]);
    expect(groups.done).toEqual([]);
  });
});
