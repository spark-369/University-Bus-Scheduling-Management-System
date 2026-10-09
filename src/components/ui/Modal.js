'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
}) => {
  const [mounted, setMounted] = useState(false);

  // Portals can only target document.body on the client, after mount.
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  // Rendered via a portal on document.body so the modal is never clipped or
  // repositioned by ancestors that create a containing block (e.g. elements
  // with a CSS transform, filter or backdrop-filter such as the page
  // transition wrapper or the blurred navbar).
  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/70 animate-fade-in"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className={`
          relative bg-slate-900 rounded-2xl shadow-2xl ring-1 ring-slate-700 w-full ${sizes[size]}
          animate-scale-in
        `}>
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              {title && <h3 className="text-base font-semibold text-slate-100">{title}</h3>}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
                >
                  <FiX size={20} />
                </button>
              )}
            </div>
          )}
          
          {/* Body */}
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
