import React from 'react';
import { useNotification } from '../../hooks/useNotification';
import './NotificationContainer.css';

const NotificationContainer = () => {
  const { notifications, dismiss } = useNotification();

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
        >
          <div className="notification-content">
            {notification.message}
          </div>
          <button
            className="notification-close"
            onClick={() => dismiss(notification.id)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;