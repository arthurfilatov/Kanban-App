import { useState, type KeyboardEvent } from "react";

interface TextInputProps {
  initialValue?: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  placeholder?: string;
  className?: string;
}

export function TextInput({
  initialValue = "",
  onSave,
  onCancel,
  placeholder = "Введите текст...",
  className = "",
}: TextInputProps) {
  const [value, setValue] = useState(initialValue);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault;
      if (value.trim()) {
        onSave(value.trim());
      } else {
        onCancel();
      }
    }
    if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <textarea
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (!value.trim()) {
            onCancel();
          } else {
            onSave(value.trim());
          }
        }}
        placeholder={placeholder}
        className="w-full p-3 rounded-xl border-2 border-blue-500 shadow-sm outline-none resize-none text-sm bg-white"
        rows={3}
      />
      <div className="flex gap-2">
        <button
          onClick={() => value.trim() && onSave(value.trim())}
          className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          Сохранить
        </button>
        <button
          onClick={onCancel}
          className="text-slate-500 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
        ></button>
      </div>
    </div>
  );
}
