import React, { useId } from 'react';

/**
 * Reusable Radio Button Component
 * 
 * Props:
 * - value: radio value
 * - checked: checked state
 * - onChange: change handler
 * - label: label text
 * - error: error message (optional)
 * - disabled: disabled state (optional)
 * - name: radio group name (required for grouping)
 * - className: additional classes
 * - ...rest: other HTML attributes
 */
export const Radio = React.forwardRef(({
  value,
  checked = false,
  onChange,
  label,
  error,
  disabled = false,
  name,
  className = '',
  ...rest
}, ref) => {
  const id = useId();

  return (
    <div className="form-group">
      <div className="form-radio-wrapper">
        <input
          ref={ref}
          id={id}
          type="radio"
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          name={name}
          className={`form-radio ${error ? 'form-radio-error' : ''} ${className}`}
          {...rest}
        />
        
        <div className="form-radio-box">
          {checked && (
            <div className="form-radio-inner"></div>
          )}
        </div>

        {label && (
          <label htmlFor={id} className="form-radio-label">
            {label}
          </label>
        )}
      </div>

      {error && <span className="form-error">{error}</span>}
    </div>
  );
});

Radio.displayName = 'Radio';
