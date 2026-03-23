import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import './AdminNavbar.css';

const AdminNavbar = ({ user, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="admin-navbar">
      <div className="navbar-brand">
        <Link to="/admin">YRHP Review Generator</Link>
      </div>

      <div className="navbar-menu">
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/logs">Logs</Link>
        <Link to="/admin/profile">Profile</Link>
      </div>

      <div className="navbar-user">
        <span className="user-email">{user?.userEmail}</span>
        <Button
          variant="secondary"
          onClick={onLogout}
          style={{ marginLeft: '10px' }}
        >
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default AdminNavbar;