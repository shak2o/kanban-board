import { useState, type FormEvent } from "react";
import { fetchTaskList, type ImportedTask } from "../domain/import";

interface ImportTasksFormProps {
  onImport: (tasks: ImportedTask[]) => void;
}

type ImportState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "success"; count: number };

export function ImportTasksForm({ onImport }: ImportTasksFormProps) {
  const [url, setUrl] = useState("/sample-tasks.json");
  const [state, setState] = useState<ImportState>({ kind: "idle" });
  const isLoading = state.kind === "loading";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ kind: "loading" });

    try {
      const imported = await fetchTaskList(url.trim());
      onImport(imported);
      setState({ kind: "success", count: imported.length });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Неизвестная ошибка";
      setState({ kind: "error", message });
    }
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <label htmlFor="import-url">Импорт задач из JSON по ссылке</label>
      <div className="add-form__row">
        <input
          id="import-url"
          type="text"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />
        <button type="submit" disabled={isLoading || url.trim() === ""}>
          {isLoading ? "Загрузка..." : "Импортировать"}
        </button>
      </div>
      {state.kind === "error" && <p role="alert" className="error">{state.message}</p>}
      {state.kind === "success" && (
        <p role="status" className="success">Импортировано задач: {state.count}</p>
      )}
    </form>
  );
}
