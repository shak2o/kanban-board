import { STATUSES, groupByStatus, type Status, type Task } from "../domain/tasks";
import { Column } from "./Column";

export const COLUMN_TITLES: Record<Status, string> = {
  todo: "К выполнению",
  "in-progress": "В работе",
  done: "Готово",
};

interface BoardProps {
  tasks: Task[];
  onMove: (id: string, status: Status) => void;
  onDelete: (id: string) => void;
}

export function Board({ tasks, onMove, onDelete }: BoardProps) {
  const groups = groupByStatus(tasks);

  return (
    <div className="board">
      {STATUSES.map((status) => (
        <Column
          key={status}
          title={COLUMN_TITLES[status]}
          status={status}
          tasks={groups[status]}
          onMove={onMove}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
