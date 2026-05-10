import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../types';
import { ROLE_ROUTES } from '../../utils/constants';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
  modulePath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, modulePath }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Could be a custom spinner component
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.status !== 'ACTIVE') {
    // If pending verification, they shouldn't access dashboard
    return <Navigate to="/pending-verification" replace />;
  }

  // Role based check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Module path check based on constants
  if (modulePath) {
    const userAllowedRoutes = ROLE_ROUTES[user.role];
    const isAllowed = userAllowedRoutes.some(route => modulePath.startsWith(route));
    if (!isAllowed) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};
