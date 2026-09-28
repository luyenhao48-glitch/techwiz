import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function RequireAdmin({ children }) {
  const { isAuthenticated, isAdmin, currentUser } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/admin/login"
        state={{ from: location.pathname, reason: 'unauthenticated' }}
        replace
      />
    );
  }

  if (!isAdmin) {
    return (
      <Navigate
        to="/admin/login"
        state={{
          from: location.pathname,
          reason: 'unauthorized',
          userEmail: currentUser?.email || 'N/A',
        }}
        replace
      />
    );
  }

  return children;
}
