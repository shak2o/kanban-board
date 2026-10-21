import { useState, type FormEvent } from "react";
import { MAX_TITLE_LENGTH } from "../domain/tasks";

interface AddTaskFormProps {
  onAdd: (title: string) => void;
}

export function AddTaskForm({ onAdd }: AddTaskFormProps) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();

    if (trimmed === "") {
      setError("Введите название задачи");
      return;
    }
    if (trimmed.length > MAX_TITLE_LENGTH) {
      setError(`Название не длиннее ${MAX_TITLE_LENGTH} символов`);
      return;
    }

    onAdd(trimmed);
    setTitle("");
    setError(null);
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <label htmlFor="task-title">Новая задача</label>
      <div className="add-form__row">
        <input
          id="task-title"
          type="text"
          value={title}
          placeholder="Например, написать тесты"
          onChange={(event) => {
            setTitle(event.target.value);
            setError(null);
          }}
        />
        <button type="submit">Добавить</button>
      </div>
      {error && <p role="alert" className="error">{error}</p>}
    </form>
  );
}
