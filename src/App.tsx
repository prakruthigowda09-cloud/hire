import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Home from './pages/Home';
import RecordsTable from './pages/RecordsTable';
import AddRecord from './pages/AddRecord';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ImportData from './pages/ImportData';
import ExportData from './pages/ExportData';
import EditRecord from './pages/EditRecord';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/records" element={<RecordsTable />} />
            <Route path="/add" element={<AddRecord />} />
            
            {/* Auth */}
            <Route path="/admin/login" element={<Login />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/admin/records" element={
              <ProtectedRoute><RecordsTable /></ProtectedRoute>
            } />
            <Route path="/admin/records/edit/:id" element={
              <ProtectedRoute><EditRecord /></ProtectedRoute>
            } />
            <Route path="/admin/import" element={
              <ProtectedRoute><ImportData /></ProtectedRoute>
            } />
            <Route path="/admin/export" element={
              <ProtectedRoute><ExportData /></ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
