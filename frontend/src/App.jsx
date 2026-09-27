import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BarberDashboard from './pages/BarberDashboard';
import BarberSalary from './pages/BarberSalary';
import Queue from './pages/Queue';
import Booking from './pages/Booking';
import Transaction from './pages/Transaction';
import Services from './pages/Services';
import Products from './pages/Products';

import Barbers from './pages/Barbers';
import Users from './pages/Users';
import SalarySlips from './pages/SalarySlips';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Role-based route wrapper
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect based on role
    if (user?.role === 'barber') {
      return <Navigate to="/barber-dashboard" />;
    }
    return <Navigate to="/" />;
  }
  
  return <MainLayout>{children}</MainLayout>;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (isAuthenticated()) {
    // Redirect based on role
    if (user?.role === 'barber') {
      return <Navigate to="/barber-dashboard" />;
    }
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Barber Routes */}
        <Route
          path="/barber-dashboard"
          element={
            <RoleRoute allowedRoles={['barber']}>
              <BarberDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/barber-queues"
          element={
            <RoleRoute allowedRoles={['barber']}>
              <Queue />
            </RoleRoute>
          }
        />
        <Route
          path="/barber-schedule"
          element={
            <RoleRoute allowedRoles={['barber']}>
              <Booking />
            </RoleRoute>
          }
        />
        <Route
          path="/barber-salary"
          element={
            <RoleRoute allowedRoles={['barber']}>
              <BarberSalary />
            </RoleRoute>
          }
        />

        {/* Admin & Cashier Routes */}
        <Route
          path="/"
          element={
            <RoleRoute allowedRoles={['admin', 'cashier']}>
              <Dashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/queue"
          element={
            <RoleRoute allowedRoles={['admin', 'cashier']}>
              <Queue />
            </RoleRoute>
          }
        />
        <Route
          path="/booking"
          element={
            <RoleRoute allowedRoles={['admin', 'cashier']}>
              <Booking />
            </RoleRoute>
          }
        />
        <Route
          path="/transaction"
          element={
            <RoleRoute allowedRoles={['admin', 'cashier']}>
              <Transaction />
            </RoleRoute>
          }
        />
        <Route
          path="/services"
          element={
            <RoleRoute allowedRoles={['admin', 'cashier']}>
              <Services />
            </RoleRoute>
          }
        />
        <Route
          path="/products"
          element={
            <RoleRoute allowedRoles={['admin', 'cashier']}>
              <Products />
            </RoleRoute>
          }
        />

        <Route
          path="/barbers"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <Barbers />
            </RoleRoute>
          }
        />
        <Route
          path="/users"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <Users />
            </RoleRoute>
          }
        />
        <Route
          path="/salary-slips"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <SalarySlips />
            </RoleRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <Reports />
            </RoleRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <RoleRoute allowedRoles={['admin', 'cashier', 'barber']}>
              <Settings />
            </RoleRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
