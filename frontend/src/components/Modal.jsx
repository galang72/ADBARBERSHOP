import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop dengan nuansa gelap elegan */}
      <div
        className="fixed inset-0 bg-accent-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl transform transition-all border border-secondary-200`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header dengan accent warna */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-100 bg-gradient-to-r from-cream-50 to-white">
              <h3 className="text-lg font-bold text-accent-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-accent-400 hover:text-primary-800 hover:bg-primary-50 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
