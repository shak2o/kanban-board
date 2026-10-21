import { useEffect, useState } from "react";
import { AddTaskForm } from "./components/AddTaskForm";
import { Board } from "./components/Board";
import { loadTasks, saveTasks } from "./domain/storage";
import { addTask, moveTask, removeTask, type Status, type Task } from "./domain/tasks";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks(window.localStorage));

  useEffect(() => {
    try {
      saveTasks(window.localStorage, tasks);
    } catch {
      // Storage can be full or blocked; the board keeps working in memory.
    }
  }, [tasks]);

  function handleAdd(title: string) {
    setTasks(addTask(tasks, title, crypto.randomUUID()));
  }

  function handleMove(id: string, status: Status) {
    setTasks(moveTask(tasks, id, status));
  }

  function handleDelete(id: string) {
    setTasks(removeTask(tasks, id));
  }

  return (
    <main className="app">
      <header>
        <h1>Трекер задач</h1>
      </header>
      <AddTaskForm onAdd={handleAdd} />
      <Board tasks={tasks} onMove={handleMove} onDelete={handleDelete} />
    </main>
  );
}
