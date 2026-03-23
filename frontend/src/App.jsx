import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './routes/ProtectedRoute';
import NotificationContainer from './components/common/NotificationContainer';

import LoginPage from './pages/auth/LoginPage';

const PlaceholderPage = ({ name }) => (
  <div style={{ padding: '20px' }}>
    <h1>{name} (Coming Soon)</h1>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <NotificationContainer />
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="ROLE_USER">
                  <PlaceholderPage name="Admin Dashboard" />
                </ProtectedRoute>
              }
            />

            <Route
              path="/client"
              element={
                <ProtectedRoute requiredRole="ROLE_CLIENT">
                  <PlaceholderPage name="Client Dashboard" />
                </ProtectedRoute>
              }
            />
            // Add these routes to the Routes section:
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="ROLE_USER">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/clients/new"
              element={
                <ProtectedRoute requiredRole="ROLE_USER">
                  <CreateClient />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/clients/:id/edit"
              element={
                <ProtectedRoute requiredRole="ROLE_USER">
                  <EditClient />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;