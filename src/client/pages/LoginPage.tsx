import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import '../styles/LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | 'admin' | 'director' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const demoAccounts = {
    student: { email: 'ahmed@almashaeel.edu.sa', password: 'password123', name: 'أحمد محمد' },
    teacher: { email: 'khalid@almashaeel.edu.sa', password: 'password123', name: 'خالد علي' },
    admin: { email: 'admin@almashaeel.edu.sa', password: 'password123', name: 'الإدارة' },
    director: { email: 'director@almashaeel.edu.sa', password: 'password123', name: 'المدير' },
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      setError('يرجى اختيار دور المستخدم');
      return;
    }

    if (!email || !password) {
      setError('يرجى ملء جميع الحقول');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role: selectedRole,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'فشل تسجيل الدخول');
      }

      const data = await response.json();
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (role: 'student' | 'teacher' | 'admin' | 'director') => {
    const account = demoAccounts[role];
    setSelectedRole(role);
    setEmail(account.email);
    setPassword(account.password);
  };

  const translations = {
    ar: {
      title: 'نظام إدارة مدرسة المشاعل',
      selectRole: 'اختر دور المستخدم',
      student: 'طالب',
      teacher: 'معلم',
      admin: 'إداري',
      director: 'مدير',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      login: 'تسجيل الدخول',
      forgotPassword: 'هل نسيت كلمة المرور؟',
      demoAccounts: 'حسابات تجريبية',
      demoPassword: 'كلمة المرور: password123',
      loading: 'جاري التحميل...',
    },
    en: {
      title: 'Al-Mashael School Management System',
      selectRole: 'Select your role',
      student: 'Student',
      teacher: 'Teacher',
      admin: 'Admin',
      director: 'Director',
      email: 'Email',
      password: 'Password',
      login: 'Login',
      forgotPassword: 'Forgot password?',
      demoAccounts: 'Demo Accounts',
      demoPassword: 'Password: password123',
      loading: 'Loading...',
    },
  };

  const t = translations[language];

  return (
    <div className={`login-page ${isDark ? 'dark' : 'light'}`}>
      <div className="login-container">
        {/* Header Controls */}
        <div className="login-header-controls">
          <button className="theme-toggle-btn" onClick={toggleTheme} title={language === 'ar' ? 'تبديل المظهر' : 'Toggle theme'}>
            {isDark ? '☀️' : '🌙'}
          </button>
          <button className="language-toggle-btn" onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}>
            {language === 'ar' ? 'EN' : 'AR'}
          </button>
        </div>

        <div className="login-content">
          {/* Logo Section */}
          <div className="logo-section">
            <div className="logo-icon">📚</div>
            <h1 className="school-name">{t.title}</h1>
            <p className="school-subtitle">نظام متكامل لإدارة العملية التعليمية</p>
          </div>

          {/* Login Form */}
          <div className="login-form-container">
            <form onSubmit={handleLogin} className="login-form">
              <h2>{t.selectRole}</h2>

              {/* Role Selection */}
              <div className="role-selection">
                {(['student', 'teacher', 'admin', 'director'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    className={`role-btn ${selectedRole === role ? 'active' : ''}`}
                    onClick={() => setSelectedRole(role)}
                    title={t[role]}
                  >
                    {role === 'student' && '👨‍🎓'}
                    {role === 'teacher' && '👨‍🏫'}
                    {role === 'admin' && '👔'}
                    {role === 'director' && '⭐'}
                    <span>{t[role]}</span>
                  </button>
                ))}
              </div>

              {/* Error Message */}
              {error && <div className="error-message">{error}</div>}

              {/* Email Input */}
              <div className="form-group">
                <label className="form-label">{t.email}</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@school.com"
                    disabled={isLoading}
                  />
                  <span className="input-icon">✉️</span>
                </div>
              </div>

              {/* Password Input */}
              <div className="form-group">
                <label className="form-label">{t.password}</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <a href="#" className="forgot-password">{t.forgotPassword}</a>

              {/* Login Button */}
              <button
                type="submit"
                className="login-btn"
                disabled={isLoading || !selectedRole}
              >
                {isLoading ? t.loading : t.login}
              </button>
            </form>

            {/* Demo Accounts */}
            <div className="demo-accounts-section">
              <h3>{t.demoAccounts}</h3>
              <p className="demo-password-hint">{t.demoPassword}</p>
              <div className="demo-accounts-grid">
                {(['student', 'teacher', 'admin', 'director'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    className="demo-account-btn"
                    onClick={() => fillDemoAccount(role)}
                  >
                    {role === 'student' && '👨‍🎓'}
                    {role === 'teacher' && '👨‍🏫'}
                    {role === 'admin' && '👔'}
                    {role === 'director' && '⭐'}
                    <span>{t[role]}</span>
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
