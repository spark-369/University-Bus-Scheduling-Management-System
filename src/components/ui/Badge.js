'use client';

const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const variants = {
    default: 'bg-slate-800 text-slate-200 ring-slate-700',
    primary: 'bg-blue-500/15 text-blue-300 ring-blue-500/30',
    success: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
    danger: 'bg-red-500/15 text-red-300 ring-red-500/30',
    info: 'bg-cyan-500/15 text-cyan-300 ring-cyan-500/30',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span 
      className={`
        inline-flex items-center gap-1 font-medium rounded-full ring-1 ring-inset
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
