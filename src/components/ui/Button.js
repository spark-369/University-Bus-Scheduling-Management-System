'use client';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props 
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-[background-color,box-shadow,transform] duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none select-none';

  const variants = {
    primary: 'bg-blue-600 text-white shadow-sm hover:bg-blue-500 hover:shadow focus-visible:ring-blue-500',
    secondary: 'bg-slate-700 text-white shadow-sm hover:bg-slate-600 focus-visible:ring-slate-500',
    success: 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 focus-visible:ring-emerald-500',
    danger: 'bg-red-600 text-white shadow-sm hover:bg-red-500 focus-visible:ring-red-500',
    warning: 'bg-amber-500 text-white shadow-sm hover:bg-amber-400 focus-visible:ring-amber-500',
    outline: 'border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:border-slate-600 focus-visible:ring-blue-500',
    ghost: 'text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:ring-slate-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${disabled || loading ? disabledStyles : ''}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
