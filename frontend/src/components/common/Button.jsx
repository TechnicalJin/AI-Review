import React from 'react';
import './Button.css';

const Button = ({
  children,
  variant = 'primary',
  disabled = false,
  loading = false,
  ...props
}) => {
  return (
    <button
      className={`btn btn-${variant}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;