import React from 'react';
import './Alert.css';

const Alert = ({ type = 'info', children, onClose }) => {
  return (
    <div className={`alert alert-${type}`}>
      <div className="alert-content">{children}</div>
      {onClose && (
        <button className="alert-close" onClick={onClose}>✕</button>
      )}
    </div>
  );
};

export default Alert;