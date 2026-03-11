import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2 } from "lucide-react";
import type { Task, Priority } from "../types";
import { TaskForm } from "./TaskForm";

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (
    id: string,
    data: { title: string; description: string; priority: Priority },
  ) => void;
}

const priorityConfig = {
  low: {
    color: "bg-green-100 text-green-700 border-green-200",
    label: "Низкий",
  },
  medium: {
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    label: "Средний",
  },
  high: { color: "bg-red-100 text-red-700 border-red-200", label: "Высокий" },
};

export function TaskCard({ task, onDelete, onEdit }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  if (isEditing) {
    return (
      <div className="z-10">
        <TaskForm
          initialData={task}
          onSave={(data) => {
            onEdit(task.id, data);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  // const config = priorityConfig[task.priority || 'low'];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-blue-400 transition-all cursor-grab active:cursor-grabbing"
    >
      <span
        className={`text-[10px] px-2 py-0.5 rounded-full border w-fit font-bold uppercase tracking-wider ${priorityConfig[task.priority].color}`}
      >
        {priorityConfig[task.priority].label}
      </span>
      <div
        onClick={() => setIsEditing(true)}
        //className="text-sm text-slate-800 pr-8 font-medium leading-relaxed"
      >
        <h3 className="text-sm font-bold text-slate-800 leading-tight">
          {task.title}
        </h3>
        {task.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 italic">
            {task.description}
          </p>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(task.id);
        }}
        className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Удалить задачу"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
