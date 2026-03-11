import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useState, useMemo } from "react";
import { nanoid } from "nanoid";
import type { ColumnType, Priority, Task } from "./types";
import { Column } from "./components/Column";
import { TextInput } from "./components/TextInput";
import { Search, X, Plus } from "lucide-react";
import { ConfirmModal } from "./components/ConfirmModal";
import { kanbanApi } from "./api/kanbanApi";

type ModalState =
  | { type: "task"; id: string }
  | { type: "column"; id: string }
  | null;

export function App() {
  const [columns, setColumns] = useState<ColumnType[]>([]);

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal] = useState<ModalState>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await kanbanApi.getColumns();
        setColumns(data);
      } catch (err) {
        console.error("Ошибка загрузки данных", err);
      }
    };
    loadData();
  }, []);

  const updateAndSave = async (newColumns: ColumnType[]) => {
    const previousColumns = [...newColumns];
    setColumns(newColumns);

    try {
      await kanbanApi.updateBoard(newColumns);
    } catch (err) {
      console.error("Ошибка сохранения данных", err);
      setColumns(previousColumns);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredColumns = useMemo(() => {
    const query = searchQuery.toLocaleLowerCase();
    return columns.map((col) => ({
      ...col,
      tasks: col.tasks.filter(
        (task) =>
          task.title.toLocaleLowerCase().includes(query) ||
          (task.description?.toLocaleLowerCase() ?? "").includes(query),
      ),
    }));
  }, [columns, searchQuery]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeColumn = columns.find((col) =>
      col.tasks.some((t) => t.id === over.id),
    );

    const overColumn = columns.find(
      (col) => col.id === over.id || col.tasks.some((t) => t.id === over.id),
    );

    if (!activeColumn || !overColumn) return;

    if (activeColumn.id === overColumn.id) {
      const oldIndex = activeColumn.tasks.findIndex((t) => t.id === active.id);
      const newIndex = activeColumn.tasks.findIndex((t) => t.id === over.id);

      if (oldIndex !== newIndex) {
        const newColumns = columns.map((col) => {
          if (col.id === activeColumn.id) {
            return {
              ...col,
              tasks: arrayMove(col.tasks, oldIndex, newIndex),
            };
          }
          return col;
        });
        updateAndSave(newColumns);
      }
    } else {
      updateAndSave(columns);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    setColumns((prev) => {
      const activeCol = prev.find((col) =>
        col.tasks.some((t) => t.id === activeId),
      );
      const overCol = prev.find(
        (col) => col.id === overId || col.tasks.some((t) => t.id === overId),
      );

      if (!activeCol || !overCol || activeCol === overCol) return prev;

      const activeTask = activeCol.tasks.find((t) => t.id === activeId);

      if (!activeTask) return prev;

      return prev.map((col) => {
        if (col.id === activeCol.id) {
          return { ...col, tasks: col.tasks.filter((t) => t.id !== activeId) };
        }
        if (col.id === overCol.id) {
          const isOverATask = overCol.tasks.some((t) => t.id === overId);
          let newIndex = overCol.tasks.length;

          if (isOverATask) {
            newIndex = overCol.tasks.findIndex((t) => t.id === overId);
          }
          const newTasks = [...col.tasks];
          newTasks.splice(newIndex, 0, activeTask);

          return { ...col, tasks: newTasks };
        }
        return col;
      });
    });
  };

  const addTask = async (
    columnId: string,
    taskData: { title: string; description: string; priority: Priority },
  ) => {
    const newTask: Task = {
      id: nanoid(),
      ...taskData,
    };
    const updated = columns.map((col) =>
      col.id === columnId ? { ...col, tasks: [newTask, ...col.tasks] } : col,
    );
    await updateAndSave(updated);
  };

  const editTask = async (
    taskId: string,
    updatedData: { title: string; description: string; priority: Priority },
  ) => {
    const updated = columns.map((col) => ({
      ...col,
      tasks: col.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updatedData } : task,
      ),
    }));
    await updateAndSave(updated);
  };

  const deleteTask = (taskId: string) => {
    setModal({ type: "task", id: taskId });
  };

  const addColumn = async (title: string) => {
    const newColumn: ColumnType = {
      id: nanoid(),
      title: title,
      tasks: [],
    };
    await updateAndSave([...columns, newColumn]);
  };

  const deleteColumn = (columnId: string) => {
    setModal({ type: "column", id: columnId });
  };

  const editColumnTitle = async (columnID: string, newTitle: string) => {
    if (!newTitle.trim()) return;

    const updated = columns.map((col) =>
      col.id === columnID ? { ...col, title: newTitle } : col,
    );
    await updateAndSave(updated);
  };

  const handleConfirmDelete = async () => {
    if (!modal) return;

    let updated;
    if (modal.type === "column") {
      updated = columns.filter((col) => col.id !== modal.id);
    } else {
      updated = columns.map((col) => ({
        ...col,
        tasks: col.tasks.filter((task) => task.id !== modal.id),
      }));
    }
    await updateAndSave(updated);
    setModal(null);
  };

  let addColumnContent;
  if (isAddingColumn) {
    addColumnContent = (
      <TextInput
        onSave={(title) => {
          addColumn(title);
          setIsAddingColumn(false);
        }}
        onCancel={() => setIsAddingColumn(false)}
        placeholder="Название колонки"
      />
    );
  } else {
    addColumnContent = (
      <div className="flex justify-center">
        <button
          onClick={() => setIsAddingColumn(true)}
          className="p-3 bg-slate-200/50 hover:bg-slate-200 border border-dashed border-slate-300 hover:border-slate-400 rounded-xl text-slate-500 transition-all group"
          title="Добавить колонку"
        >
          <Plus
            size={20}
            className="group-hover:scale-110 transition-transform"
          />
        </button>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="px-4 md:px-10 flex flex-col gap-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-6">
            Kanban Board
          </h1>

          <div className="relative w-full max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Поиск задач..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex gap-6 items-start">
            {filteredColumns.map((col) => (
              <Column
                key={col.id}
                column={col}
                onAddTask={addTask}
                onDeleteTask={deleteTask}
                onEditTask={editTask}
                onDeleteColumn={deleteColumn}
                onEditColumnTitle={editColumnTitle}
              />
            ))}
            <div className="w-80 shrink-0">{addColumnContent}</div>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={modal !== null}
        title={
          modal?.type === "column" ? "Удалить колонку?" : "Удалить задачу?"
        }
        message={
          modal?.type === "column"
            ? "Вы уверены? Все задачи в этой колонке удалятся."
            : "Задача будет безвозвратно удалена. Вы уверены?"
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setModal(null)}
      />
    </DndContext>
  );
}
