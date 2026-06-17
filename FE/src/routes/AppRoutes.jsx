import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { getToken, getRoleId } from '../utils/auth';
import MainLayout from '../components/layout/MainLayout';
import Login from '../pages/Login';
import OTPLogin from '../pages/OTPLogin';
import Dashboard from '../pages/Dashboard';
import Users from '../pages/Users';
import Categories from '../pages/Categories';
import Tickets from '../pages/Tickets';
import TicketDetail from '../pages/TicketDetail';
import Reports from '../pages/Reports';
import AuditLogs from '../pages/AuditLogs';

const ProtectedRoute = ({ children }) => {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const uStr = localStorage.getItem('user');
  let role = 3; // Default to User
  if (uStr) {
    try {
      role = getRoleId(JSON.parse(uStr));
    } catch(e) {}
  }
  
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/tickets" replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/login/otp" element={<OTPLogin />} />
      
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<RoleProtectedRoute allowedRoles={[1, 4]}><Dashboard /></RoleProtectedRoute>} />
        <Route path="users" element={<RoleProtectedRoute allowedRoles={[1]}><Users /></RoleProtectedRoute>} />
        <Route path="categories" element={<Categories />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="tickets/:id" element={<TicketDetail />} />
        <Route path="reports" element={<RoleProtectedRoute allowedRoles={[1, 4]}><Reports /></RoleProtectedRoute>} />
        <Route path="audit-logs" element={<RoleProtectedRoute allowedRoles={[1, 4]}><AuditLogs /></RoleProtectedRoute>} />
      </Route>

      {/* Catch-all route to prevent blank screens on invalid URLs */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
