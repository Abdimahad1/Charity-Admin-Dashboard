// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AdminLayout from './admin/AdminLayout.jsx';
import ProtectedRoute from './admin/ProtectedRoute.jsx';

// Pages
import AdminLogin from './admin/pages/adminLogin.jsx';
import Dashboard from './admin/pages/Dashboard.jsx';
import Charities from './admin/pages/Charities.jsx';
import Donations from './admin/pages/Donations.jsx';
import Reports from './admin/pages/Reports.jsx';
import Volunteers from './admin/pages/Volunteers.jsx';
import Homepage from './admin/pages/Homepage.jsx';
import Settings from './admin/pages/Settings.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public login */}
      <Route path="/" element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin (protected) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* /admin -> /admin/dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />

        <Route path="dashboard" element={<Dashboard />} />

        <Route path="charities" element={<Charities />} />
        <Route path="donations" element={<Donations />} />
        <Route path="reports" element={<Reports />} />
        <Route path="volunteers" element={<Volunteers />} />
        <Route path="homepage" element={<Homepage />} />
        <Route path="settings" element={<Settings />} />
       
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
