import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Spinner from '../common/Spinner';

const ProtectedRoute = ({ children, allowedRoles = [], allowPending = false }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check if user is approved (except for admin)
  // If allowPending is true, we skip this check (for onboarding pages)
  if (user?.role !== 'admin' && user?.status !== 'approved' && !allowPending) {
    // If user is pending, redirect to status page (which handles both pending and rejected)
    return <Navigate to="/onboarding/status" replace />;
  }

  return children;
};

export default ProtectedRoute;