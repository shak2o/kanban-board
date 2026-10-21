import { useState, type DragEvent } from "react";
import type { Status, Task } from "../domain/tasks";
import { TaskCard } from "./TaskCard";

interface ColumnProps {
  title: string;
  status: Status;
  tasks: Task[];
  onMove: (id: string, status: Status) => void;
  onDelete: (id: string) => void;
}

export function Column({ title, status, tasks, onMove, onDelete }: ColumnProps) {
  const [isDropTarget, setIsDropTarget] = useState(false);

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDropTarget(true);
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDropTarget(false);
    const id = event.dataTransfer.getData("text/plain");
    if (id) {
      onMove(id, status);
    }
  }

  return (
    <section
      className={isDropTarget ? "column column--drop-target" : "column"}
      aria-labelledby={`column-${status}`}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDropTarget(false)}
      onDrop={handleDrop}
    >
      <h2 id={`column-${status}`}>
        {title} <span className="count">{tasks.length}</span>
      </h2>
      <ul className="task-list">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onMove={onMove} onDelete={onDelete} />
        ))}
      </ul>
    </section>
  );
}
