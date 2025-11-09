import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DirectorDashboard from './pages/DirectorDashboard';
import './styles/App.css';

const App: React.FC = () => {
  const { token, user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is still logged in
    const checkAuth = async () => {
      if (token && user) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            logout();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [token, user, logout]);

  useEffect(() => {
    // Apply theme
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>جاري التحميل...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className={`app ${isDark ? 'dark' : 'light'}`}>
        {token && (
          <header className="app-header">
            <div className="header-content">
              <h1>نظام إدارة مدرسة المشاعل</h1>
              <div className="header-controls">
                <button className="theme-toggle" onClick={toggleTheme} title="تبديل المظهر">
                  {isDark ? '☀️' : '🌙'}
                </button>
                <button className="logout-btn" onClick={logout}>تسجيل الخروج</button>
              </div>
            </div>
          </header>
        )}

        <Routes>
          {!token ? (
            <>
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            <>
              {user?.role === 'student' && (
                <Route path="/dashboard" element={<StudentDashboard />} />
              )}
              {user?.role === 'teacher' && (
                <Route path="/dashboard" element={<TeacherDashboard />} />
              )}
              {user?.role === 'admin' && (
                <Route path="/dashboard" element={<AdminDashboard />} />
              )}
              {user?.role === 'director' && (
                <Route path="/dashboard" element={<DirectorDashboard />} />
              )}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
