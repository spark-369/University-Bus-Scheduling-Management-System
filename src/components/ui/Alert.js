'use client';

import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';

const Alert = ({ 
  children, 
  variant = 'info',
  title,
  onClose,
  className = '',
}) => {
  const variants = {
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      icon: 'text-blue-400',
      titleColor: 'text-blue-200',
      textColor: 'text-blue-100',
    },
    success: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      icon: 'text-emerald-400',
      titleColor: 'text-emerald-200',
      textColor: 'text-emerald-100',
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      icon: 'text-amber-400',
      titleColor: 'text-amber-200',
      textColor: 'text-amber-100',
    },
    danger: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      icon: 'text-red-400',
      titleColor: 'text-red-200',
      textColor: 'text-red-100',
    },
  };

  const icons = {
    info: FiInfo,
    success: FiCheckCircle,
    warning: FiAlertCircle,
    danger: FiAlertCircle,
  };

  const styles = variants[variant];
  const Icon = icons[variant];

  return (
    <div className={`animate-slide-up border ${styles.border} ${styles.bg} rounded-xl p-4 ${className}`}>
      <div className="flex">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          <Icon size={20} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-semibold ${styles.titleColor}`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${styles.textColor} ${title ? 'mt-0.5' : ''}`}>
            {children}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              aria-label="Dismiss"
              className={`inline-flex rounded-md p-1 transition-colors hover:bg-white/10 ${styles.textColor}`}
            >
              <FiX size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
