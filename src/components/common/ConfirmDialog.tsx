import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} maxWidth="sm">
      <div className="space-y-5 text-xs">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            variant === 'danger'
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-500'
              : 'bg-emerald-50 dark:bg-emerald-950/40 text-brand-700 dark:text-brand-400'
          }`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed pt-1">
            {message}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-night-800 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-night-850 transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-white font-semibold shadow-xs transition-colors cursor-pointer ${
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-500'
                : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
