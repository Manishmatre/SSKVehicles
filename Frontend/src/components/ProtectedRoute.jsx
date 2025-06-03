import React, { useContext, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const location = useLocation();
  const { user, isAuthenticated, loading } = useContext(AuthContext);

  // Debug information
  useEffect(() => {
    console.log('ProtectedRoute - Auth State:', { 
      isAuthenticated, 
      hasUser: !!user, 
      loading,
      path: location.pathname,
      userRole: user?.role || 'not set' 
    });
  }, [isAuthenticated, user, loading, location.pathname]);

  // Show loading state while checking authentication
  if (loading) {
    console.log('Authentication loading, waiting...');
    return <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-2">Verifying authentication...</p>
      </div>
    </div>;
  }

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    console.log('Not authenticated, redirecting to login');
    // Not logged in, redirect to login page
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // For Firebase users, role might not be set yet
  if (allowedRoles && (!user.role || !allowedRoles.includes(user.role))) {
    // Default to user role if not set
    const effectiveRole = user.role || 'user';
    const targetPath = getDashboardPath(effectiveRole);
    console.log(`User role ${effectiveRole} not allowed, redirecting to ${targetPath}`);
    return <Navigate to={targetPath} replace />;
  }

  // Only redirect if we're at the root path
  if (location.pathname === '/') {
    const dashboardPath = getDashboardPath(user.role || 'user');
    console.log(`At root path, redirecting to dashboard: ${dashboardPath}`);
    return <Navigate to={dashboardPath} replace />;
  }

  // Authorized, render component
  console.log('User authorized, rendering protected content');
  return <Outlet />;

};

// Helper function to determine dashboard path
const getDashboardPath = (role) => {
  switch (role) {
    case 'employee':
      return '/vehicles-dashboard';
    case 'admin':
      return '/vehicles-dashboard';
    case 'manager':
      return '/vehicles-dashboard';
    default:
      return '/vehicles-dashboard';
  }
};

export default ProtectedRoute;