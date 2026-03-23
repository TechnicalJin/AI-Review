import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ fullScreen = false }) => {
  const spinnerClass = fullScreen ? 'spinner-fullscreen' : 'spinner-inline';

  return (
    <div className={`spinner-container ${spinnerClass}`}>
      <div className="spinner"></div>
    </div>
  );
};

export default LoadingSpinner;