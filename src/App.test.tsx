import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { STORAGE_KEY } from "./domain/storage";

function getColumn(title: string) {
  const heading = screen.getByRole("heading", { name: new RegExp(`^${title}`) });
  return within(heading.closest("section") as HTMLElement);
}

async function addTask(title: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Новая задача"), title);
  await user.click(screen.getByRole("button", { name: "Добавить" }));
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("App", () => {
  it("adds a new task to the first column", async () => {
    render(<App />);
    await addTask("Написать тесты");
    expect(getColumn("К выполнению").getByText("Написать тесты")).toBeTruthy();
  });

  it("shows an error and adds nothing for an empty title", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Добавить" }));
    expect(screen.getByRole("alert").textContent).toBe("Введите название задачи");
    expect(getColumn("К выполнению").queryByRole("listitem")).toBeNull();
  });

  it("moves a task to the next column with the arrow button", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addTask("Ревью кода");
    await user.click(
      getColumn("К выполнению").getByRole("button", { name: "Переместить в следующую колонку" }),
    );
    expect(getColumn("В работе").getByText("Ревью кода")).toBeTruthy();
    expect(getColumn("К выполнению").queryByText("Ревью кода")).toBeNull();
  });

  it("deletes a task", async () => {
    const user = userEvent.setup();
    render(<App />);
    await addTask("Лишняя задача");
    await user.click(getColumn("К выполнению").getByRole("button", { name: "Удалить задачу" }));
    expect(screen.queryByText("Лишняя задача")).toBeNull();
  });

  it("saves tasks to localStorage", async () => {
    render(<App />);
    await addTask("Сохранить меня");
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    expect(stored.map((task: { title: string }) => task.title)).toEqual(["Сохранить меня"]);
  });

  it("restores tasks from localStorage on start", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ id: "1", title: "Из хранилища", status: "done" }]),
    );
    render(<App />);
    expect(getColumn("Готово").getByText("Из хранилища")).toBeTruthy();
  });

  it("imports tasks from a JSON URL into the board", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify([{ title: "Из сети", status: "in-progress" }]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Импортировать" }));

    expect(await screen.findByRole("status")).toBeTruthy();
    expect(getColumn("В работе").getByText("Из сети")).toBeTruthy();
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    expect(stored).toHaveLength(1);
  });

  it("shows an error when the import request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 500 })));
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Импортировать" }));

    expect((await screen.findByRole("alert")).textContent).toBe("Сервер ответил ошибкой 500");
    expect(getColumn("К выполнению").queryByRole("listitem")).toBeNull();
  });
});
