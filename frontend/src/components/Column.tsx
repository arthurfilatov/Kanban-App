import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskCard } from "./TaskCard";
import { Trash2, Plus } from "lucide-react";
import { TextInput } from "./TextInput";
import type { ColumnType, Priority } from "../types";
import { TaskForm } from "./TaskForm";

interface ColumnProps {
  column: ColumnType;
  onAddTask: (
    id: string,
    taskData: { title: string; description: string; priority: Priority },
  ) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (
    id: string,
    taskData: { title: string; description: string; priority: Priority },
  ) => void;
  onDeleteColumn: (id: string) => void;
  onEditColumnTitle: (id: string, content: string) => void;
}

export function Column({
  column,
  onAddTask,
  onDeleteTask,
  onEditTask,
  onDeleteColumn,
  onEditColumnTitle,
}: ColumnProps) {
  const { setNodeRef } = useDroppable({ id: column.id });

  const [isAdding, setIsAdding] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  let headerContent;

  if (isEditingTitle) {
    headerContent = (
      <TextInput
        initialValue={column.title}
        onSave={(newTitle) => {
          onEditColumnTitle(column.id, newTitle);
          setIsEditingTitle(false);
        }}
        onCancel={() => setIsEditingTitle(false)}
        className="w-full"
      />
    );
  } else {
    headerContent = (
      <>
        <h2
          onClick={() => setIsEditingTitle(true)}
          className="font-semibold text-slate-500 uppercase text-xs tracking-widest px-2 cursor-pointer hover:text-slate-800 transition-colors"
        >
          {column.title} ({column.tasks.length})
        </h2>
        <div className="flex items-center gap-1 opacity-0 group-hover/column:opacity-100 transition-opacity">
          <button
            onClick={() => setIsAdding(true)}
            className="p-1 hover:bg-slate-200 rounded-md text-slate-400 hover:text-slate-600"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={() => onDeleteColumn(column.id)}
            className="p-1 hover:bg-red-50 rounded-md text-slate-400 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="w-80 shrink-0 flex flex-col gap-4 group/column">
      <div className="flex items-center justify-between px-2">
        {headerContent}
      </div>
      <div
        ref={setNodeRef}
        className="flex flex-col gap-3 p-2 bg-slate-100/50 rounded-2xl min-h-125"
      >
        {isAdding && (
          <TaskForm
            onSave={(data) => {
              onAddTask(column.id, data);
              setIsAdding(false);
            }}
            onCancel={() => setIsAdding(false)}
          ></TaskForm>
        )}
        <SortableContext
          items={column.tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={onDeleteTask}
              onEdit={onEditTask}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
