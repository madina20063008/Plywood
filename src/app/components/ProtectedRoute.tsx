// ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router';
import { useApp } from '../../lib/context';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useApp(); // Use user instead of currentUser
  
  console.log('ProtectedRoute check:', { 
    user, 
    isLoading,
    hasUser: !!user,
    localStorageUser: localStorage.getItem('user')
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('User authenticated, rendering protected content');
  return <>{children}</>;
};