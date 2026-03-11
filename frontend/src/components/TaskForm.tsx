import { useState, type KeyboardEvent, type SubmitEvent } from "react";
import type { Priority, Task } from "../types";

interface TaskFormProps {
  initialData?: Partial<Task>;
  onSave: (data: {
    title: string;
    description: string;
    priority: Priority;
  }) => void;
  onCancel: () => void;
}

export function TaskForm({ initialData, onSave, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );

  const [priority, setPriority] = useState<Priority>(
    initialData?.priority || "low",
  );

  const handleSubmit = (e?: SubmitEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Escape") {
      onCancel();
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (title.trim()) {
        onSave({
          title: title.trim(),
          description: description.trim(),
          priority,
        });
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="bg-white p-4 rounded-xl border-2 border-blue-500 shadow-lg flex flex-col gap-3"
    >
      <input
        autoFocus
        className="text-sm font-bold outline-none border-b border-slate-100 pb-1 focus:border-blue-300 transition-colors"
        placeholder="Введите заголовок задачи"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="text-xs text-slate-600 outline-none resize-none min-h-20 bg-slate-50/50 p-2 rounded-lg focus:bg-white transition-colors"
        placeholder="Описание задачи (Shift + Enter для переноса строки)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="flex items-center justify-between mt-2">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">
            Приоритет
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="text-xs bg-slate-100 p-1.5 rounded-md outline-none cursor-pointer hover:bg-slate-200 transition-colors border-r-4 border-transparent"
          >
            <option value="low">🟢 Низкий</option>
            <option value="medium">🟡 Средний</option>
            <option value="high">🔴 Высокий</option>
          </select>
        </div>
        <div className="flex gap-2 self-end">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Сохранить
          </button>
        </div>
      </div>
    </form>
  );
}
