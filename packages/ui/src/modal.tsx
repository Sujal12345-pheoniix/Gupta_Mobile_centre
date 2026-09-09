import React, { useState, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  className,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={[
        'fixed inset-0 z-50',
        'flex items-center justify-center',
        'bg-black/50 backdrop-blur-sm',
        className,
      ].join(' ')}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative rounded-lg bg-card w-full max-w-lg mx-4 shadow-lg transform scale-100">
        {title && (
          <div className="flex items-center justify-between rounded-t-md p-4 border-b border-border">
            <h3 className="text-xl font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-lg bg-muted p-1 hover:bg-muted/80"
              aria-label="Close modal"
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
        <button
          onClick={onClose}
          className="mt-2 rounded-lg bg-muted p-1 hover:bg-muted/80 w-full text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
};