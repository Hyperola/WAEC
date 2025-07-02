import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);
  const [isReady, setIsReady] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      setIsReady(true);
    }
  }, [loading]);

  console.log('ProtectedRoute - user:', user, 'required role:', role, 'loading:', loading, 'path:', location.pathname);

  if (loading || !isReady) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    console.log(`ProtectedRoute - Role mismatch (user: ${user.role}, required: ${role}), redirecting`);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;