import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User Pages
import UserHome from './pages/user/UserHome';
import UserDetails from './pages/user/UserDetails';
import LogView from './pages/user/LogView';
import CreateClient from './pages/user/CreateClient';
import EditClient from './pages/user/EditClient';
import ViewClient from './pages/user/ViewClient';

// Client Pages
import ClientHome from './pages/client/ClientHome';
import ClientHistory from './pages/client/ClientHistory';
import ChatTags from './pages/ChatTags';

// Error Page
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* User Routes (Protected) */}
            <Route
              path="/user/home"
              element={
                <PrivateRoute requiredRole="USER">
                  <UserHome />
                </PrivateRoute>
              }
            />
            <Route
              path="/user/profile"
              element={
                <PrivateRoute requiredRole="USER">
                  <UserDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/user/log"
              element={
                <PrivateRoute requiredRole="USER">
                  <LogView />
                </PrivateRoute>
              }
            />
            <Route
              path="/user/create"
              element={
                <PrivateRoute requiredRole="USER">
                  <CreateClient />
                </PrivateRoute>
              }
            />
            <Route
              path="/user/edit/:id"
              element={
                <PrivateRoute requiredRole="USER">
                  <EditClient />
                </PrivateRoute>
              }
            />
            <Route
              path="/user/view/:id"
              element={
                <PrivateRoute requiredRole="USER">
                  <ViewClient />
                </PrivateRoute>
              }
            />

            {/* Client Routes (Protected) */}
            <Route
              path="/client/home"
              element={
                <PrivateRoute requiredRole="CLIENT">
                  <ClientHome />
                </PrivateRoute>
              }
            />
            <Route
              path="/client/history"
              element={
                <PrivateRoute requiredRole="CLIENT">
                  <ClientHistory />
                </PrivateRoute>
              }
            />
            <Route
              path="/client/chatText"
              element={
                <PrivateRoute requiredRole="CLIENT">
                  <ChatTags />
                </PrivateRoute>
              }
            />
            <Route
              path="/client/chattext"
              element={
                <PrivateRoute requiredRole="CLIENT">
                  <ChatTags />
                </PrivateRoute>
              }
            />

            {/* 404 - Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;