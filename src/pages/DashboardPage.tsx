import React from 'react';
import Dashboard from '../components/Dashboard';
import PrivateRoute from '../components/PrivateRoute';

export default function DashboardPage() {
  return (
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
  );
}