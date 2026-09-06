import React from 'react';
import { Sparkles, CheckCircle2, Copy, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl border border-rose-200 shadow-xl p-3.5 flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            {t.type === 'warning' ? (
              <AlertCircle className="w-4 h-4 text-amber-600" />
            ) : (
              <Sparkles className="w-4 h-4 text-rose-500" />
            )}
          </div>
          <div className="grow min-w-0">
            <h4 className="font-bold text-xs text-gray-900">{t.title}</h4>
            {t.description && (
              <p className="text-[11px] text-gray-600 mt-0.5">{t.description}</p>
            )}
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            className="text-gray-400 hover:text-gray-700 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
