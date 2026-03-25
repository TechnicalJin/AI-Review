import React, { useId } from 'react';

/**
 * Reusable Checkbox Component
 * 
 * Props:
 * - value: checkbox value
 * - checked: checked state
 * - onChange: change handler
 * - label: label text
 * - error: error message (optional)
 * - disabled: disabled state (optional)
 * - className: additional classes
 * - ...rest: other HTML attributes
 */
export const Checkbox = React.forwardRef(({
  value,
  checked = false,
  onChange,
  label,
  error,
  disabled = false,
  className = '',
  ...rest
}, ref) => {
  const id = useId();

  return (
    <div className="form-group">
      <div className="form-checkbox-wrapper">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`form-checkbox ${error ? 'form-checkbox-error' : ''} ${className}`}
          {...rest}
        />
        
        <div className="form-checkbox-box">
          {checked && (
            <i className="fas fa-check form-checkbox-check"></i>
          )}
        </div>

        {label && (
          <label htmlFor={id} className="form-checkbox-label">
            {label}
          </label>
        )}
      </div>

      {error && <span className="form-error">{error}</span>}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
