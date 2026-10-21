import type { DragEvent } from "react";
import { STATUSES, type Status, type Task } from "../domain/tasks";

interface TaskCardProps {
  task: Task;
  onMove: (id: string, status: Status) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onMove, onDelete }: TaskCardProps) {
  const index = STATUSES.indexOf(task.status);
  const previous: Status | undefined = index > 0 ? STATUSES[index - 1] : undefined;
  const next: Status | undefined = index < STATUSES.length - 1 ? STATUSES[index + 1] : undefined;

  function handleDragStart(event: DragEvent<HTMLLIElement>) {
    event.dataTransfer.setData("text/plain", task.id);
    event.dataTransfer.effectAllowed = "move";
  }

  return (
    <li className="task-card" draggable onDragStart={handleDragStart}>
      <p className="task-title">{task.title}</p>
      <div className="task-actions">
        <button
          type="button"
          aria-label="Переместить в предыдущую колонку"
          disabled={previous === undefined}
          onClick={() => previous && onMove(task.id, previous)}
        >
          ←
        </button>
        <button
          type="button"
          aria-label="Переместить в следующую колонку"
          disabled={next === undefined}
          onClick={() => next && onMove(task.id, next)}
        >
          →
        </button>
        <button
          type="button"
          className="danger"
          aria-label="Удалить задачу"
          onClick={() => onDelete(task.id)}
        >
          Удалить
        </button>
      </div>
    </li>
  );
}
