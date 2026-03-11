import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 z-10">
        <button
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          onClick={onCancel}
        >
          <X size={20} />
        </button>
        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">
            {message}
          </p>
        </div>
        <div className="flex gap-3 mt-8">
          <button
            className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
            onClick={onConfirm}
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}
