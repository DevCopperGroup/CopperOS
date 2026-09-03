import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  text: string;
  tone: ToastTone;
}

/**
 * Fila de avisos local ao módulo — substitui os alert() nativos que eram
 * usados como placeholder de ação.
 */
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((text: string, tone: ToastTone = 'success') => {
    setToasts(prev => [...prev, { id: Date.now() + Math.random(), text, tone }]);
  }, []);

  return { toasts, showToast, dismissToast };
};

const toneStyles: Record<ToastTone, { wrapper: string; icon: React.ElementType }> = {
  success: {
    wrapper:
      'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
    icon: CheckCircle2,
  },
  error: {
    wrapper:
      'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300',
    icon: AlertTriangle,
  },
  info: {
    wrapper:
      'bg-white dark:bg-night-900 border-gray-200 dark:border-night-800 text-gray-700 dark:text-gray-300',
    icon: Info,
  },
};

const ToastCard: React.FC<{ toast: ToastMessage; onDismiss: (id: number) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const { wrapper, icon: Icon } = toneStyles[toast.tone];

  return (
    <div
      role="status"
      className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border shadow-lg text-xs font-semibold max-w-sm animate-in fade-in ${wrapper}`}
    >
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span className="flex-1 leading-relaxed">{toast.text}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Fechar aviso"
        title="Fechar aviso"
        className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export const ToastStack: React.FC<{
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastCard toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
};
