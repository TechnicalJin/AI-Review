import React, { useId } from 'react';

/**
 * Reusable Text Input Component
 * Supports: text, email, password, tel, url
 * 
 * Props:
 * - type: input type (default: 'text')
 * - value: input value
 * - onChange: change handler
 * - placeholder: placeholder text
 * - label: label (optional)
 * - error: error message (optional)
 * - disabled: disabled state (optional)
 * - required: required indicator (optional)
 * - icon: icon class for left icon (optional)
 * - rightIcon: icon class for right icon (optional)
 * - size: 'sm' | 'md' (default) | 'lg'
 * - className: additional classes
 * - ...rest: other HTML attributes
 */
export const Input = React.forwardRef(({
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  icon,
  rightIcon,
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

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="form-input-wrapper">
        {icon && <i className={`form-icon-left ${icon}`}></i>}
        
        <input
          ref={ref}
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`form-input ${sizeClasses[size]} ${error ? 'form-input-error' : ''} ${className}`}
          {...rest}
        />
        
        {rightIcon && <i className={`form-icon-right ${rightIcon}`}></i>}
      </div>

      {error && <span className="form-error">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
