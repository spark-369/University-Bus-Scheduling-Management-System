'use client';

import { FiChevronDown } from 'react-icons/fi';

const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-1.5">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`
            w-full appearance-none px-3.5 py-2 pr-9 rounded-lg border text-sm text-slate-100
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
            ${error ? 'border-red-500/70' : 'border-slate-700'}
            ${disabled ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-950 hover:border-slate-600 cursor-pointer'}
          `}
          {...props}
        >
          <option value="" className="bg-slate-900 text-slate-100">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-slate-900 text-slate-100">
              {option.label}
            </option>
          ))}
        </select>
        <FiChevronDown
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
          size={16}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Select;
