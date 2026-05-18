// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { fetchMe } from './store/slices/authSlice';

// Layout
import AppLayout from './components/layout/AppLayout';
import AuthLayout from './components/layout/AuthLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ResumesPage from './pages/ResumesPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import ResumeDetailPage from './pages/ResumeDetailPage';
import ATSCheckerPage from './pages/ATSCheckerPage';
import AIGeneratorPage from './pages/AIGeneratorPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import PublicResumePage from './pages/PublicResumePage';
import NotFoundPage from './pages/NotFoundPage';

// Guards
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, initialized } = useSelector((s) => s.auth);
  if (!initialized) return <div className="flex items-center justify-center h-screen bg-dark-300"><div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((s) => s.auth);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) dispatch(fetchMe());
    else dispatch({ type: 'auth/fetchMe/rejected' });
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#1A1A26', color: '#F0F0FF', border: '1px solid #2A2A45' },
          success: { iconTheme: { primary: '#00E580', secondary: '#1A1A26' } },
          error: { iconTheme: { primary: '#FF5577', secondary: '#1A1A26' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/resume/share/:token" element={<PublicResumePage />} />

        {/* Auth */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        </Route>

        {/* App */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/resumes" element={<ResumesPage />} />
          <Route path="/resumes/new" element={<ResumeBuilderPage />} />
          <Route path="/resumes/:id/edit" element={<ResumeBuilderPage />} />
          <Route path="/resumes/:id" element={<ResumeDetailPage />} />
          <Route path="/ats-checker" element={<ATSCheckerPage />} />
          <Route path="/ai-generator" element={<AIGeneratorPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
