/**
 * Al-Mashael School Management System - Frontend
 * @version 2.0.0
 * @author Al-Mashael Private School
 * 
 * هذا الملف يتعامل مع واجهة المستخدم الأمامية ويتصل بـ API الخادم
 */

'use strict';

// ===== Configuration =====
const API_BASE_URL = '/api';
const STORAGE_KEY = 'al_mashael_token';

// ===== DOM Elements =====
const DOM = {
  loginForm: document.getElementById('loginForm'),
  emailInput: document.getElementById('email'),
  passwordInput: document.getElementById('password'),
  togglePasswordBtn: document.getElementById('togglePassword'),
  loginBtn: document.querySelector('.login-btn'),
  loadingOverlay: document.getElementById('loadingOverlay'),
  toastContainer: document.getElementById('toastContainer'),
  rememberMeCheckbox: document.getElementById('rememberMe'),
  themeToggle: document.getElementById('themeToggle'),
};

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', function() {
  setupEventListeners();
  checkExistingSession();
  loadThemePreference();
});

// ===== Event Listeners =====
function setupEventListeners() {
  // Form submission
  if (DOM.loginForm) {
    DOM.loginForm.addEventListener('submit', handleLogin);
  }

  // Toggle password visibility
  if (DOM.togglePasswordBtn) {
    DOM.togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
  }

  // Theme toggle
  if (DOM.themeToggle) {
    DOM.themeToggle.addEventListener('click', toggleTheme);
  }

  // Demo account buttons
  const demoBtns = document.querySelectorAll('.demo-btn');
  demoBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const card = this.closest('.demo-card');
      const email = card.getAttribute('data-email');
      const password = 'password123';
      fillDemoAccount(email, password);
    });
  });
}

// ===== Login Handler =====
async function handleLogin(e) {
  e.preventDefault();

  const email = DOM.emailInput.value.trim();
  const password = DOM.passwordInput.value;
  const rememberMe = DOM.rememberMeCheckbox.checked;

  // Validation
  if (!email || !password) {
    showToast('الرجاء ملء جميع الحقول', 'error');
    return;
  }

  try {
    // Show loading
    showLoadingOverlay(true);
    disableLoginButton(true);

    // Make API request
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'فشل تسجيل الدخول');
    }

    // Save token
    if (data.token) {
      localStorage.setItem(STORAGE_KEY, data.token);
      
      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem('al_mashael_remember_email', email);
      } else {
        localStorage.removeItem('al_mashael_remember_email');
      }

      // Show success message
      showToast('تم تسجيل الدخول بنجاح', 'success');

      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1500);
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast(error.message || 'حدث خطأ في تسجيل الدخول', 'error');
  } finally {
    showLoadingOverlay(false);
    disableLoginButton(false);
  }
}

// ===== Demo Account Handler =====
function fillDemoAccount(email, password) {
  DOM.emailInput.value = email;
  DOM.passwordInput.value = password;
  DOM.loginForm.scrollIntoView({ behavior: 'smooth' });
  DOM.emailInput.focus();
  showToast('تم ملء بيانات الحساب التجريبي', 'info');
}

// ===== Password Visibility Toggle =====
function togglePasswordVisibility() {
  const type = DOM.passwordInput.type === 'password' ? 'text' : 'password';
  DOM.passwordInput.type = type;
  
  const icon = DOM.togglePasswordBtn.querySelector('i');
  icon.classList.toggle('fa-eye');
  icon.classList.toggle('fa-eye-slash');
}

// ===== Session Check =====
function checkExistingSession() {
  const token = localStorage.getItem(STORAGE_KEY);
  const rememberEmail = localStorage.getItem('al_mashael_remember_email');

  if (rememberEmail) {
    DOM.emailInput.value = rememberEmail;
    DOM.rememberMeCheckbox.checked = true;
  }

  // If user has token, redirect to dashboard
  if (token) {
    // Verify token is still valid
    verifyToken(token);
  }
}

// ===== Token Verification =====
async function verifyToken(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      // Token is valid, redirect to dashboard
      window.location.href = '/dashboard.html';
    } else {
      // Token is invalid, remove it
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.error('Token verification error:', error);
    localStorage.removeItem(STORAGE_KEY);
  }
}

// ===== UI Helpers =====
function showLoadingOverlay(show) {
  if (DOM.loadingOverlay) {
    DOM.loadingOverlay.style.display = show ? 'flex' : 'none';
  }
}

function disableLoginButton(disabled) {
  if (DOM.loginBtn) {
    DOM.loginBtn.disabled = disabled;
    const loader = DOM.loginBtn.querySelector('.btn-loader');
    const text = DOM.loginBtn.querySelector('span');
    if (loader && text) {
      loader.style.display = disabled ? 'inline-block' : 'none';
      text.style.display = disabled ? 'none' : 'inline';
    }
  }
}

// ===== Toast Notifications =====
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type} animate__animated animate__slideInUp`;
  
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle',
    warning: 'fa-exclamation-triangle',
  };

  toast.innerHTML = `
    <i class="fas ${icons[type]}"></i>
    <span>${message}</span>
  `;

  DOM.toastContainer.appendChild(toast);

  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.classList.remove('animate__slideInUp');
    toast.classList.add('animate__slideOutUp');
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}

// ===== Theme Management =====
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  
  if (isDark) {
    html.removeAttribute('data-theme');
    localStorage.removeItem('al_mashael_theme');
    DOM.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  } else {
    html.setAttribute('data-theme', 'dark');
    localStorage.setItem('al_mashael_theme', 'dark');
    DOM.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
}

function loadThemePreference() {
  const savedTheme = localStorage.getItem('al_mashael_theme');
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    DOM.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
}

// ===== Logout Function =====
function logout() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('al_mashael_remember_email');
  window.location.href = '/';
}

// ===== API Helper Functions =====
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem(STORAGE_KEY);
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = '/';
    throw new Error('جلسة العمل انتهت، الرجاء تسجيل الدخول مجدداً');
  }

  return response;
}

// ===== Export Functions for Global Use =====
window.fillDemoAccount = fillDemoAccount;
window.logout = logout;
window.apiCall = apiCall;
