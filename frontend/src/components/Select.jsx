import React from 'react';

const Select = ({ 
  label, 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Pilih...',
  error,
  required,
  className = '',
  ...props 
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-accent-700 mb-1.5">
          {label}
          {required && <span className="text-primary-800 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        required={required}
        className={`
          w-full px-4 py-2.5 rounded-xl border bg-cream-50
          focus:outline-none focus:ring-2 focus:ring-primary-800/20 focus:border-primary-800
          transition-all duration-200
          ${error 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-secondary-200 hover:border-secondary-300'
          }
          text-accent-900
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
};

export default Select;
