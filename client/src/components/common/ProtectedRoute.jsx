import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, role, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Enforce mandatory password reset on first login
  if (user?.mustChangePassword) {
    return <Navigate to="/force-change-password" replace />;
  }

  // Map backend roles or emergency role
  const normalizedRole = role ? role.toUpperCase() : '';
  const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());

  if (allowedRoles.length > 0 && !normalizedAllowed.includes(normalizedRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
