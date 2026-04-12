import React from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { getToken, setToken, setPortalRole } from './api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Filters from './pages/Filters';

function Layout({ children }) {
  const navigate = useNavigate();
  const onLogout = () => {
    setToken(null);
    setPortalRole('');
    navigate('/login');
  };

  if (!getToken()) return children;

  return (
    <div>
      <header
        style={{
          background: '#1a73e8',
          color: '#fff',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <strong>AquaSmart Admin</strong>
        <Link to="/" style={{ color: '#fff' }}>
          Dashboard
        </Link>
        <Link to="/users" style={{ color: '#fff' }}>
          Users
        </Link>
        <Link to="/filters" style={{ color: '#fff' }}>
          Filters
        </Link>
        <span style={{ flex: 1 }} />
        <button
          type="button"
          onClick={onLogout}
          style={{
            background: 'transparent',
            border: '1px solid #fff',
            color: '#fff',
            borderRadius: 6,
            padding: '6px 12px',
          }}
        >
          Logout
        </button>
      </header>
      <main style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>{children}</main>
    </div>
  );
}

function PrivateRoute({ children }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/users"
        element={
          <PrivateRoute>
            <Users />
          </PrivateRoute>
        }
      />
      <Route
        path="/filters"
        element={
          <PrivateRoute>
            <Filters />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
