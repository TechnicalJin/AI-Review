import React from 'react';
import './Input.css';

const Input = ({
  label,
  error,
  required = false,
  ...props
}) => {
  return (
    <div className="input-group">
      {label && (
        <label>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input {...props} />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
};

export default Input;