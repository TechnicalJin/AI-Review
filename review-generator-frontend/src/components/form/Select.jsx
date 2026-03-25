import React, { useId } from 'react';

/**
 * Reusable Select/Dropdown Component
 * 
 * Props:
 * - value: selected value
 * - onChange: change handler
 * - options: array of { value, label } or array of strings
 * - placeholder: placeholder text
 * - label: label (optional)
 * - error: error message (optional)
 * - disabled: disabled state (optional)
 * - required: required indicator (optional)
 * - size: 'sm' | 'md' (default) | 'lg'
 * - className: additional classes
 * - ...rest: other HTML attributes
 */
export const Select = React.forwardRef(({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
  required = false,
  size = 'md',
  className = '',
  ...rest
}, ref) => {
  const id = useId();

  const sizeClasses = {
    sm: 'form-input-sm',
    md: 'form-input-md',
    lg: 'form-input-lg'
  };

  // Normalize options format
  const normalizedOptions = options.map(opt =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="form-select-wrapper">
        <select
          ref={ref}
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`form-input form-select ${sizeClasses[size]} ${error ? 'form-input-error' : ''} ${className}`}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {normalizedOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <i className="form-select-arrow fas fa-chevron-down"></i>
      </div>

      {error && <span className="form-error">{error}</span>}
    </div>
  );
});

Select.displayName = 'Select';
