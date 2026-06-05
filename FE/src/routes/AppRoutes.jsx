import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { getToken } from '../utils/auth';
import MainLayout from '../components/layout/MainLayout';
import Login from '../pages/Login';
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

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="categories" element={<Categories />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="tickets/:id" element={<TicketDetail />} />
        <Route path="reports" element={<Reports />} />
        <Route path="audit-logs" element={<AuditLogs />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
