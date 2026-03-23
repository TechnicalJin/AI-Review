import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AdminNavbar from './AdminNavbar';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <AdminNavbar user={user} onLogout={handleLogout} />
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;