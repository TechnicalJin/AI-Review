import React, { useId } from 'react';

/**
 * Reusable Textarea Component
 * 
 * Props:
 * - value: textarea value
 * - onChange: change handler
 * - placeholder: placeholder text
 * - label: label (optional)
 * - error: error message (optional)
 * - disabled: disabled state (optional)
 * - required: required indicator (optional)
 * - rows: number of rows (default: 4)
 * - maxLength: max character limit (optional)
 * - showCharCount: show character count (optional)
 * - size: 'sm' | 'md' (default) | 'lg'
 * - className: additional classes
 * - ...rest: other HTML attributes
 */
export const Textarea = React.forwardRef(({
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  rows = 4,
  maxLength,
  showCharCount = false,
  size = 'md',
  className = '',
  ...rest
}, ref) => {
  const id = useId();

  const sizeClasses = {
    sm: 'form-textarea-sm',
    md: 'form-textarea-md',
    lg: 'form-textarea-lg'
  };

  const charCount = value?.length || 0;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="form-textarea-wrapper">
        <textarea
          ref={ref}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          className={`form-textarea ${sizeClasses[size]} ${error ? 'form-input-error' : ''} ${className}`}
          {...rest}
        />
        
        {maxLength && showCharCount && (
          <div className="form-char-count">
            {charCount} / {maxLength}
          </div>
        )}
      </div>

      {error && <span className="form-error">{error}</span>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
