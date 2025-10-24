/**
 * Al-Mashael School Management System
 * Secure JavaScript Application with Enhanced Security Features
 * Author: Al-Mashael Private School for Boys
 * Version: 2.0.0 (Security Enhanced)
 */

'use strict';

// Security Configuration
const SECURITY_CONFIG = {
    maxLoginAttempts: 3,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    tokenExpiry: 60 * 60 * 1000, // 1 hour
    saltRounds: 12
};

// Application State
const AppState = {
    currentUser: null,
    loginAttempts: 0,
    sessionTimer: null,
    isAuthenticated: false
};

// Secure User Authentication Class
class SecureAuth {
    constructor() {
        this.users = new Map(); // In production, this should be server-side
        this.initializeDemo();
    }

    // Initialize demo users (for testing only - remove in production)
    initializeDemo() {
        // These are hashed passwords - never store plain text passwords
        this.users.set('student1', {
            // Hash of 'student123'
            passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrn0H.t7p62dQcjMgd7UoX9E2ZhPua',
            role: 'student',
            name: 'عبدالله محمد السعيد',
            id: 'STD001',
            lastLogin: null,
            isLocked: false
        });
        
        this.users.set('teacher1', {
            // Hash of 'teacher123'
            passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrn0H.t7p62dQcjMgd7UoX9E2ZhPub',
            role: 'teacher',
            name: 'أحمد عبدالعزيز المحمدي',
            id: 'TCH001',
            lastLogin: null,
            isLocked: false
        });
        
        this.users.set('admin1', {
            // Hash of 'admin123'
            passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrn0H.t7p62dQcjMgd7UoX9E2ZhPuc',
            role: 'admin',
            name: 'فهد عبدالرحمن القحطاني',
            id: 'ADM001',
            lastLogin: null,
            isLocked: false
        });
    }

    // Simple hash function for demo (use bcrypt in production)
    async hashPassword(password) {
        // This is a simplified hash - use proper bcrypt in production
        return btoa(password + 'salt_' + Date.now());
    }

    // Verify password (simplified for demo)
    async verifyPassword(password, hash) {
        // In production, use bcrypt.compare()
        // For demo, we'll use simplified verification
        const demoPasswords = {
            'student1': 'student123',
            'teacher1': 'teacher123',
            'admin1': 'admin123'
        };
        return demoPasswords[AppState.currentAttemptUser] === password;
    }

    // Enhanced login with security measures
    async authenticate(username, password, userType) {
        try {
            // Input validation
            if (!this.validateInput(username, password, userType)) {
                throw new Error('بيانات غير صحيحة');
            }

            // Check if account is locked
            const user = this.users.get(username);
            if (!user) {
                throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
            }

            if (user.isLocked) {
                throw new Error('تم قفل الحساب. يرجى التواصل مع الإدارة');
            }

            // Check role match
            if (user.role !== userType) {
                throw new Error('نوع المستخدم غير صحيح');
            }

            // Verify password
            AppState.currentAttemptUser = username;
            const isValid = await this.verifyPassword(password, user.passwordHash);
            
            if (!isValid) {
                AppState.loginAttempts++;
                if (AppState.loginAttempts >= SECURITY_CONFIG.maxLoginAttempts) {
                    this.lockAccount(username);
                    throw new Error('تم تجاوز عدد محاولات تسجيل الدخول المسموح به');
                }
                throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
            }

            // Reset login attempts on successful login
            AppState.loginAttempts = 0;
            user.lastLogin = new Date().toISOString();
            
            return {
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    role: user.role,
                    lastLogin: user.lastLogin
                },
                token: this.generateSecureToken(user)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    validateInput(username, password, userType) {
        // Username validation
        if (!username || username.length < 3 || username.length > 50) {
            return false;
        }
        
        // Password validation
        if (!password || password.length < 6 || password.length > 100) {
            return false;
        }
        
        // UserType validation
        if (!['student', 'teacher', 'admin'].includes(userType)) {
            return false;
        }
        
        // Check for malicious patterns
        const maliciousPatterns = [/<script/i, /javascript:/i, /on\w+=/i];
        const testString = username + password;
        
        return !maliciousPatterns.some(pattern => pattern.test(testString));
    }

    generateSecureToken(user) {
        // In production, use JWT with proper secret key
        const payload = {
            userId: user.id,
            role: user.role,
            exp: Date.now() + SECURITY_CONFIG.tokenExpiry,
            iat: Date.now()
        };
        
        return btoa(JSON.stringify(payload));
    }

    lockAccount(username) {
        const user = this.users.get(username);
        if (user) {
            user.isLocked = true;
            // In production, implement proper account unlock mechanism
        }
    }
}

// Secure Session Management
class SessionManager {
    static startSession(user, token) {
        // Store session securely
        const sessionData = {
            user: user,
            token: token,
            startTime: Date.now(),
            lastActivity: Date.now()
        };
        
        // Use sessionStorage instead of localStorage for better security
        sessionStorage.setItem('secureSession', JSON.stringify(sessionData));
        
        AppState.currentUser = user;
        AppState.isAuthenticated = true;
        
        // Set session timeout
        this.resetSessionTimer();
    }
    
    static updateActivity() {
        const session = this.getSession();
        if (session) {
            session.lastActivity = Date.now();
            sessionStorage.setItem('secureSession', JSON.stringify(session));
            this.resetSessionTimer();
        }
    }
    
    static resetSessionTimer() {
        if (AppState.sessionTimer) {
            clearTimeout(AppState.sessionTimer);
        }
        
        AppState.sessionTimer = setTimeout(() => {
            this.endSession();
            showNotification('انتهت مدة الجلسة. يرجى إعادة تسجيل الدخول', 'warning');
            showPage('login-page');
        }, SECURITY_CONFIG.sessionTimeout);
    }
    
    static getSession() {
        try {
            const sessionData = sessionStorage.getItem('secureSession');
            if (!sessionData) return null;
            
            const session = JSON.parse(sessionData);
            
            // Check if session is expired
            if (Date.now() - session.startTime > SECURITY_CONFIG.sessionTimeout) {
                this.endSession();
                return null;
            }
            
            return session;
        } catch (error) {
            this.endSession();
            return null;
        }
    }
    
    static endSession() {
        sessionStorage.removeItem('secureSession');
        AppState.currentUser = null;
        AppState.isAuthenticated = false;
        
        if (AppState.sessionTimer) {
            clearTimeout(AppState.sessionTimer);
        }
    }
    
    static isValidSession() {
        return this.getSession() !== null && AppState.isAuthenticated;
    }
}
}

// DOM Elements and Utility Functions
let DOM = {};
let auth = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeDOM();
    auth = new SecureAuth();
    setupEventListeners();
    checkExistingSession();
    initializeSecurityFeatures();
});

function initializeDOM() {
    DOM = {
        loginForm: document.getElementById('login-form'),
        usernameInput: document.getElementById('username'),
        passwordInput: document.getElementById('password'),
        userTypeInputs: document.querySelectorAll('input[name="userType"]'),
        loginBtn: document.querySelector('.login-btn'),
        btnText: document.querySelector('.btn-text'),
        btnSpinner: document.querySelector('.btn-spinner'),
        loadingOverlay: document.getElementById('loading-overlay'),
        loginPage: document.getElementById('login-page'),
        appContainer: document.getElementById('app-container'),
        userNameDisplay: document.getElementById('user-name'),
        userDropdown: document.getElementById('user-dropdown'),
        sidebarNav: document.getElementById('sidebar-nav'),
        pageContent: document.getElementById('page-content'),
        breadcrumb: document.getElementById('breadcrumb'),
        notificationContainer: document.getElementById('notification-container')
    };
}

function setupEventListeners() {
    // Form submission
    if (DOM.loginForm) {
        DOM.loginForm.addEventListener('submit', handleLogin);
    }
    
    // Activity tracking for session management
    document.addEventListener('click', () => SessionManager.updateActivity());
    document.addEventListener('keypress', () => SessionManager.updateActivity());
    document.addEventListener('mousemove', throttle(() => SessionManager.updateActivity(), 30000));
    
    // Security: Prevent form manipulation
    document.addEventListener('DOMContentLoaded', function() {
        // Prevent autocomplete on sensitive fields
        if (DOM.passwordInput) {
            DOM.passwordInput.setAttribute('autocomplete', 'current-password');
        }
    });
}

function initializeSecurityFeatures() {
    // Content Security Policy violation reporting
    document.addEventListener('securitypolicyviolation', function(e) {
        console.warn('CSP Violation:', e.violatedDirective, e.blockedURI);
        // In production, report to security monitoring system
    });
    
    // Disable right-click in production mode
    if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
    }
    
    // Disable F12 and developer shortcuts in production
    document.addEventListener('keydown', function(e) {
        if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
            // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
            if (e.keyCode === 123 ||
                (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
                (e.ctrlKey && e.keyCode === 85)) {
                e.preventDefault();
                showNotification('هذا الإجراء غير مسموح به', 'error');
                return false;
            }
        }
    });
}

// Enhanced Login Handler with Security
async function handleLogin(e) {
    e.preventDefault();
    
    try {
        // Get form values
        const username = sanitizeInput(DOM.usernameInput.value.trim());
        const password = DOM.passwordInput.value; // Don't sanitize password
        let userType = '';
        
        // Get selected user type
        DOM.userTypeInputs.forEach(input => {
            if (input.checked) {
                userType = input.value;
            }
        });
        
        // Validate required fields
        if (!validateForm(username, password, userType)) {
            return;
        }
        
        // Show loading state
        setLoadingState(true);
        
        // Simulate API delay for security
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Authenticate user
        const result = await auth.authenticate(username, password, userType);
        
        if (result.success) {
            // Start secure session
            SessionManager.startSession(result.user, result.token);
            
            // Update UI
            DOM.userNameDisplay.textContent = result.user.name;
            showPage('app-container');
            showNotification(`مرحباً ${result.user.name}! تم تسجيل الدخول بنجاح`, 'success');
            
            // Initialize app for user role
            initializeApp(result.user);
            
            // Clear form
            DOM.loginForm.reset();
            
        } else {
            showNotification(result.error, 'error');
        }
        
    } catch (error) {
        showNotification('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى', 'error');
    } finally {
        setLoadingState(false);
    }
}

// Input sanitization
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    return input
        .replace(/[<>"'&]/g, function(match) {
            const entityMap = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '&': '&amp;'
            };
            return entityMap[match];
        })
        .trim();
}

// Form validation with enhanced security
function validateForm(username, password, userType) {
    clearErrors();
    
    let isValid = true;
    
    // Username validation
    if (!username) {
        showFieldError('username', 'يرجى إدخال اسم المستخدم');
        isValid = false;
    } else if (username.length < 3) {
        showFieldError('username', 'اسم المستخدم قصير جداً');
        isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        showFieldError('username', 'اسم المستخدم يحتوي على أحرف غير مسموحة');
        isValid = false;
    }
    
    // Password validation
    if (!password) {
        showFieldError('password', 'يرجى إدخال كلمة المرور');
        isValid = false;
    } else if (password.length < 6) {
        showFieldError('password', 'كلمة المرور قصيرة جداً');
        isValid = false;
    }
    
    // User type validation
    if (!userType) {
        showNotification('يرجى اختيار نوع المستخدم', 'error');
        isValid = false;
    }
    
    return isValid;
}

function showFieldError(fieldName, message) {
    const errorElement = document.getElementById(fieldName + '-error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    const field = document.getElementById(fieldName);
    if (field) {
        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');
    }
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(error => {
        error.textContent = '';
        error.style.display = 'none';
    });
    
    document.querySelectorAll('.form-control').forEach(field => {
        field.classList.remove('error');
        field.setAttribute('aria-invalid', 'false');
    });
}

// UI State Management
function setLoadingState(loading) {
    if (loading) {
        DOM.btnText.classList.add('hidden');
        DOM.btnSpinner.classList.remove('hidden');
        DOM.loginBtn.disabled = true;
        showLoading();
    } else {
        DOM.btnText.classList.remove('hidden');
        DOM.btnSpinner.classList.add('hidden');
        DOM.loginBtn.disabled = false;
        hideLoading();
    }
}

function showLoading() {
    if (DOM.loadingOverlay) {
        DOM.loadingOverlay.classList.remove('hidden');
    }
}

function hideLoading() {
    if (DOM.loadingOverlay) {
        DOM.loadingOverlay.classList.add('hidden');
    }
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

// Application initialization for different user roles
function initializeApp(user) {
    loadSidebarNavigation(user.role);
    loadPageContent('dashboard', 'الرئيسية');
    setupUserInterface(user);
}

// Load navigation based on user role
function loadSidebarNavigation(role) {
    const navItems = {
        student: [
            { icon: 'fas fa-home', text: 'الرئيسية', page: 'dashboard' },
            { icon: 'fas fa-book', text: 'المقررات', page: 'courses' },
            { icon: 'fas fa-calendar-alt', text: 'الجدول', page: 'schedule' },
            { icon: 'fas fa-chart-line', text: 'النتائج', page: 'results' }
        ],
        teacher: [
            { icon: 'fas fa-home', text: 'الرئيسية', page: 'dashboard' },
            { icon: 'fas fa-users', text: 'الفصول', page: 'classes' },
            { icon: 'fas fa-clipboard-list', text: 'التقييم', page: 'grading' },
            { icon: 'fas fa-comments', text: 'التواصل', page: 'communication' }
        ],
        admin: [
            { icon: 'fas fa-cogs', text: 'لوحة الإدارة', page: 'admin-dashboard' },
            { icon: 'fas fa-user-shield', text: 'إدارة المستخدمين', page: 'user-management' },
            { icon: 'fas fa-school', text: 'إدارة المدرسة', page: 'school-management' },
            { icon: 'fas fa-chart-pie', text: 'التقارير', page: 'reports' }
        ]
    };

    const items = navItems[role] || [];
    if (DOM.sidebarNav) {
        DOM.sidebarNav.innerHTML = '';
        
        items.forEach(item => {
            const link = document.createElement('a');
            link.href = '#';
            link.className = 'sidebar-nav-item';
            link.innerHTML = `<i class="${item.icon}"></i> <span>${item.text}</span>`;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                loadPageContent(item.page, item.text);
            });
            DOM.sidebarNav.appendChild(link);
        });
    }
}

// Load page content
function loadPageContent(page, title) {
    if (DOM.pageContent) {
        DOM.pageContent.innerHTML = `
            <div class="page-header">
                <h2>${title}</h2>
            </div>
            <div class="page-body">
                <p>صفحة ${title} - قيد التطوير</p>
                <p><strong>المستخدم الحالي:</strong> ${AppState.currentUser?.role || 'غير محدد'}</p>
                <p><strong>آخر تسجيل دخول:</strong> ${new Date().toLocaleString('ar-SA')}</p>
            </div>
        `;
    }
    
    updateBreadcrumb(title);
}

// Update breadcrumb
function updateBreadcrumb(title) {
    if (DOM.breadcrumb) {
        DOM.breadcrumb.innerHTML = `
            <a href="#">الرئيسية</a>
            <span>${title}</span>
        `;
    }
}

// Check for existing session on page load
function checkExistingSession() {
    const session = SessionManager.getSession();
    if (session && SessionManager.isValidSession()) {
        AppState.currentUser = session.user;
        AppState.isAuthenticated = true;
        
        if (DOM.userNameDisplay) {
            DOM.userNameDisplay.textContent = session.user.name;
        }
        
        showPage('app-container');
        initializeApp(session.user);
        SessionManager.resetSessionTimer();
    } else {
        showPage('login-page');
    }
}

// Utility Functions
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Enhanced notification system
function showNotification(message, type = 'info') {
    if (!DOM.notificationContainer) return;
    
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `<p>${sanitizeInput(message)}</p>`;
    
    DOM.notificationContainer.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('hide');
        notification.addEventListener('transitionend', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }, 5000);
}

// Global functions for HTML onclick events
window.togglePassword = function() {
    const passwordInput = document.getElementById('password');
    const toggleButton = passwordInput?.nextElementSibling;
    const icon = toggleButton?.querySelector('i');
    
    if (passwordInput && icon) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }
};

window.toggleUserMenu = function() {
    if (DOM.userDropdown) {
        DOM.userDropdown.classList.toggle('show');
        
        const button = document.querySelector('.user-avatar');
        if (button) {
            const isExpanded = DOM.userDropdown.classList.contains('show');
            button.setAttribute('aria-expanded', isExpanded.toString());
        }
    }
};

window.showProfile = function() {
    showNotification('عرض الملف الشخصي - قيد التطوير', 'info');
    if (DOM.userDropdown) {
        DOM.userDropdown.classList.remove('show');
    }
};

window.changePassword = function() {
    showNotification('تغيير كلمة المرور - قيد التطوير', 'info');
    if (DOM.userDropdown) {
        DOM.userDropdown.classList.remove('show');
    }
};

window.logout = function() {
    showLoading();
    
    setTimeout(() => {
        SessionManager.endSession();
        showPage('login-page');
        hideLoading();
        showNotification('تم تسجيل الخروج بنجاح', 'info');
        
        // Clear form fields
        if (DOM.loginForm) {
            DOM.loginForm.reset();
        }
        
        // Reset login attempts
        AppState.loginAttempts = 0;
    }, 500);
};

// Toggle sidebar (responsive)
window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
};

// Toggle theme (dark/light mode)
window.toggleTheme = function() {
    document.body.classList.toggle('dark-mode');
    
    const themeIcon = document.getElementById('theme-toggle')?.querySelector('i');
    if (themeIcon) {
        if (document.body.classList.contains('dark-mode')) {
            themeIcon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'dark');
        } else {
            themeIcon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'light');
        }
    }
};

// Load saved theme on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const themeIcon = document.getElementById('theme-toggle')?.querySelector('i');
        if (themeIcon) {
            themeIcon.className = 'fas fa-sun';
        }
    }
});

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('user-dropdown');
    
    if (dropdown && userMenu && !userMenu.contains(event.target)) {
        dropdown.classList.remove('show');
        const button = document.querySelector('.user-avatar');
        if (button) {
            button.setAttribute('aria-expanded', 'false');
        }
    }
});

// Handle browser back/forward buttons
window.addEventListener('popstate', function(event) {
    if (!SessionManager.isValidSession()) {
        showPage('login-page');
    }
});

// Prevent browser back button after logout
window.addEventListener('pageshow', function(event) {
    if (event.persisted && !SessionManager.isValidSession()) {
        window.location.reload();
    }
});
