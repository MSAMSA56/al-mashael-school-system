import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, error, loading, clearError } = useAuthStore();
  const { language, setLanguage, t } = useLanguageStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | 'admin' | 'director'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const unsubscribe = useAuthStore.getState().initAuth();
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    if (useAuthStore.getState().isAuthenticated) {
      navigate('/dashboard');
    }
  }, [useAuthStore.getState().isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(email, password, selectedRole);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const demoAccounts = [
    { email: 'ahmed@almashaeel.edu.sa', role: 'student', name: t('login.student') },
    { email: 'khalid@almashaeel.edu.sa', role: 'teacher', name: t('login.teacher') },
    { email: 'admin@almashaeel.edu.sa', role: 'admin', name: t('login.admin') },
    { email: 'director@almashaeel.edu.sa', role: 'director', name: t('login.director') },
  ];

  const handleDemoLogin = (email: string, role: string) => {
    setEmail(email);
    setPassword('password123');
    setSelectedRole(role as any);
  };

  return (
    <div className={`login-page ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="login-header-controls">
        <button
          className="theme-toggle-btn"
          onClick={() => setIsDarkMode(!isDarkMode)}
          title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <button
          className="language-toggle-btn"
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          title={language === 'ar' ? 'English' : 'العربية'}
        >
          {language === 'ar' ? 'EN' : 'AR'}
        </button>
      </div>

      <div className="login-container">
        <div className="login-content">
          <div className="logo-section">
            <div className="logo-icon">⭐</div>
            <h1 className="school-name">{t('login.title')}</h1>
            <p className="school-subtitle">{t('login.subtitle')}</p>
          </div>

          <div className="login-form-container">
            <form className="login-form" onSubmit={handleLogin}>
              <h2>{t('login.login')}</h2>

              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label className="form-label">{t('login.role')}</label>
                <div className="role-selection">
                  {(['student', 'teacher', 'admin', 'director'] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      className={`role-btn ${selectedRole === role ? 'active' : ''}`}
                      onClick={() => setSelectedRole(role)}
                    >
                      <span>
                        {role === 'student' && '👨‍🎓'}
                        {role === 'teacher' && '👨‍🏫'}
                        {role === 'admin' && '👨‍💼'}
                        {role === 'director' && '⭐'}
                      </span>
                      <span>{t(`login.${role}`)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('login.email')}</label>
                <div className="input-wrapper">
                  <span className="input-icon">✉️</span>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('login.email')}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('login.password')}</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('login.password')}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <a href="#" className="forgot-password">
                {t('login.forgotPassword')}
              </a>

              <button
                type="submit"
                className="login-btn"
                disabled={loading}
              >
                {loading ? t('common.loading') : t('login.loginButton')}
              </button>
            </form>

            <div className="demo-accounts-section">
              <h3>{t('login.demoAccounts')}</h3>
              <p className="demo-password-hint">{t('login.demoPassword')}</p>
              <div className="demo-accounts-grid">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    className="demo-account-btn"
                    onClick={() => handleDemoLogin(account.email, account.role)}
                  >
                    <span>
                      {account.role === 'student' && '👨‍🎓'}
                      {account.role === 'teacher' && '👨‍🏫'}
                      {account.role === 'admin' && '👨‍💼'}
                      {account.role === 'director' && '⭐'}
                    </span>
                    <span>{account.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
