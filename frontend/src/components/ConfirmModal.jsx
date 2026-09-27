import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Hapus', cancelText = 'Batal', type = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl transform transition-all p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-secondary-400 hover:text-secondary-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Icon */}
          <div className="flex items-center justify-center mb-4">
            <div className={`p-3 rounded-full ${type === 'danger' ? 'bg-red-100' : 'bg-yellow-100'}`}>
              <AlertTriangle className={`h-8 w-8 ${type === 'danger' ? 'text-red-600' : 'text-yellow-600'}`} />
            </div>
          </div>

          {/* Content */}
          <h3 className="text-lg font-semibold text-secondary-900 text-center mb-2">
            {title}
          </h3>
          <p className="text-secondary-500 text-center mb-6">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              variant={type === 'danger' ? 'danger' : 'primary'}
              onClick={onConfirm}
              className="flex-1"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
