import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { getCurrentUser } from './store/slices/authSlice';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AuthCallbackPage from './pages/auth/AuthCallbackPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ResumeEditorPage from './pages/resume/ResumeEditorPage';
import PublicResume from './pages/PublicResume';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import PageLoader from './components/common/PageLoader';

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (initialCheckDone) return;
      
      console.log('🔍 App: Checking authentication...');
      const token = localStorage.getItem('accessToken');
      
      // Always try to get current user on mount
      // If access token exists, it will use it
      // If not, the refresh token cookie might still be valid and will auto-refresh
      try {
        console.log('📡 App: Attempting to restore session...');
        await dispatch(getCurrentUser()).unwrap();
        console.log('✅ App: Session restored successfully');
      } catch (error) {
        console.log('❌ App: No valid session found');
        // Clear any stale access token
        if (token) {
          localStorage.removeItem('accessToken');
        }
      }
      
      setInitialCheckDone(true);
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [dispatch, initialCheckDone]);

  // Show loader during initial auth check
  if (isCheckingAuth) {
    return <PageLoader text="Loading..." fullScreen />;
  }

  return (
    <ErrorBoundary>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/r/:shareId" element={<PublicResume />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/resumes" element={<DashboardPage />} />
          <Route path="/resumes/new" element={<ResumeEditorPage />} />
          <Route path="/resumes/:id/edit" element={<ResumeEditorPage />} />
        </Route>

        {/* Redirect */}
        <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
