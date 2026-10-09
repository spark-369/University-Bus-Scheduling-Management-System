'use client';

const Card = ({ 
  children, 
  title, 
  subtitle,
  footer,
  className = '',
  onClick,
  hover = false,
}) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-slate-900 rounded-xl border border-slate-800 shadow-sm
        ${hover ? 'cursor-pointer transition-all duration-200 hover:shadow-md hover:border-slate-700 hover:-translate-y-0.5' : 'transition-shadow duration-200'}
        ${className}
      `}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-slate-800">
          {title && <h3 className="text-base font-semibold text-slate-100">{title}</h3>}
          {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-slate-950/50 border-t border-slate-800">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
