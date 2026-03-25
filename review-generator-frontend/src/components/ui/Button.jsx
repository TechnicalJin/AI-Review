import React from 'react';

const sizeMap = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
};

const variantMap = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
};

const Button = ({
  as: Component = 'button',
  size = 'md',
  variant = 'primary',
  className = '',
  type,
  children,
  ...props
}) => {
  const resolvedSize = sizeMap[size] || sizeMap.md;
  const resolvedVariant = variantMap[variant] || variantMap.primary;
  const resolvedType = Component === 'button' ? type || 'button' : undefined;

  return (
    <Component
      type={resolvedType}
      className={`btn ${resolvedSize} ${resolvedVariant} motion-fast ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Button;
