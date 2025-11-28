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
    // If user is not approved and not on an allowed pending page, redirect to onboarding
    if (user?.role === 'worker') {
      return <Navigate to="/worker/onboarding" replace />;
    } else if (user?.role === 'company') {
      return <Navigate to="/company/onboarding" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;