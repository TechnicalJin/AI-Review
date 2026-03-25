import React from 'react';

const ButtonGroup = ({ className = '', children, ...props }) => {
  return (
    <div className={`btn-group ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};

export default ButtonGroup;
