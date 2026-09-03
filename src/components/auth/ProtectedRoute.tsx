import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCopperOS } from '../../context/CopperOSContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useCopperOS();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page and preserve attempted target URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
