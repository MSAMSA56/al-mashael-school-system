/**
 * Al-Mashael School Management System
 * @version 1.0.0
 * @author Al-Mashael Private School
 */

'use strict';

// DOM Elements
const DOM = {};

// User data for demo (في الإنتاج، يجب أن يكون هذا في الخادم)
const users = {
    student1: { password: 'student123', role: 'student', name: 'عبدالله محمد السعيد' },
    teacher1: { password: 'teacher123', role: 'teacher', name: 'أحمد عبدالعزيز المحمدي' },
    admin1: { password: 'admin123', role: 'admin', name: 'فهد عبدالرحمن القحطاني' }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeDOM();
    setupEventListeners();
    checkExistingSession();
});

function initializeDOM() {
    DOM.loginForm = document.getElementById('login-form');
    DOM.usernameInput = document.getElementById('username');
    DOM.passwordInput = document.getElementById('password');
    DOM.userTypeInputs = document.querySelectorAll('input[name="userType"]');
    DOM.loginBtn = document.querySelector('.login-btn');
    DOM.btnText = document.querySelector('.btn-text');
    DOM.btnSpinner = document.querySelector('.btn-spinner');
    DOM.loadingOverlay = document.getElementById('loading-overlay');
    DOM.loginPage = document.getElementById('login-page');
    DOM.appContainer = document.getElementById('app-container');
    DOM.userNameDisplay = document.getElementById('user-name');
    DOM.userDropdown = document.getElementById('user-dropdown');
    DOM.sidebarNav = document.getElementById('sidebar-nav');
    DOM.pageContent = document.getElementById('page-content');
    DOM.breadcrumb = document.getElementById('breadcrumb');
    DOM.notificationContainer = document.getElementById('notification-container');
}

function setupEventListeners() {
    if (DOM.loginForm) {
        DOM.loginForm.addEventListener('submit', handleLogin);
    }
    
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const username = DOM.usernameInput.value.trim();
    const password = DOM.passwordInput.value;
    let userType = '';
    
    DOM.userTypeInputs.forEach(input => {
        if (input.checked) {
            userType = input.value;
        }
    });
    
    if (!username || !password || !userType) {
        showNotification('يرجى إدخال جميع البيانات المطلوبة', 'error');
        return;
    }
    
    setLoadingState(true);
    
    setTimeout(function() {
        const user = users[username];
        
        if (user && user.password === password && user.role === userType) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            DOM.userNameDisplay.textContent = user.name;
            showPage('app-container');
            showNotification('مرحباً ' + user.name + '! تم تسجيل الدخول بنجاح', 'success');
            initializeApp(user);
            DOM.loginForm.reset();
        } else {
            showNotification('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
        }
        
        setLoadingState(false);
    }, 1000);
}

function initializeApp(user) {
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
    
    const items = navItems[user.role] || [];
    if (DOM.sidebarNav) {
        DOM.sidebarNav.innerHTML = '';
        
        items.forEach(function(item) {
            const link = document.createElement('a');
            link.href = '#';
            link.className = 'sidebar-nav-item';
            link.innerHTML = '<i class="' + item.icon + '"></i> <span>' + item.text + '</span>';
            link.addEventListener('click', function(e) {
                e.preventDefault();
                loadPageContent(item.page, item.text);
            });
            DOM.sidebarNav.appendChild(link);
        });
    }
    
    const defaultPage = items[0] ? items[0].page : 'dashboard';
    const defaultTitle = items[0] ? items[0].text : 'الرئيسية';
    loadPageContent(defaultPage, defaultTitle);
}

function loadPageContent(page, title) {
    if (DOM.pageContent) {
        DOM.pageContent.innerHTML = '<div class="page-header"><h2>' + title + '</h2></div>' +
            '<div class="page-body">' +
            '<p>صفحة ' + title + ' - قيد التطوير</p>' +
            '<p><strong>المستخدم الحالي:</strong> ' + (JSON.parse(localStorage.getItem('currentUser')).role || 'غير محدد') + '</p>' +
            '<p><strong>آخر تسجيل دخول:</strong> ' + new Date().toLocaleString('ar-SA') + '</p>' +
            '</div>';
    }
    
    if (DOM.breadcrumb) {
        DOM.breadcrumb.innerHTML = '<a href="#">الرئيسية</a><span>' + title + '</span>';
    }
}

function checkExistingSession() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        const user = JSON.parse(storedUser);
        DOM.userNameDisplay.textContent = user.name;
        showPage('app-container');
        initializeApp(user);
    } else {
        showPage('login-page');
    }
}

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
    document.querySelectorAll('.page').forEach(function(page) {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

function showNotification(message, type) {
    type = type || 'info';
    
    if (!DOM.notificationContainer) return;
    
    const notification = document.createElement('div');
    notification.className = 'notification notification--' + type;
    notification.innerHTML = '<p>' + message + '</p>';
    
    DOM.notificationContainer.appendChild(notification);
    
    setTimeout(function() {
        notification.classList.add('hide');
        setTimeout(function() {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 3000);
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleButton = passwordInput.nextElementSibling;
    const icon = toggleButton.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function toggleUserMenu() {
    if (DOM.userDropdown) {
        DOM.userDropdown.classList.toggle('show');
    }
}

function showProfile() {
    showNotification('عرض الملف الشخصي - قيد التطوير', 'info');
    if (DOM.userDropdown) {
        DOM.userDropdown.classList.remove('show');
    }
}

function changePassword() {
    showNotification('تغيير كلمة المرور - قيد التطوير', 'info');
    if (DOM.userDropdown) {
        DOM.userDropdown.classList.remove('show');
    }
}

function logout() {
    showLoading();
    
    setTimeout(function() {
        localStorage.removeItem('currentUser');
        showPage('login-page');
        hideLoading();
        showNotification('تم تسجيل الخروج بنجاح', 'info');
        
        if (DOM.loginForm) {
            DOM.loginForm.reset();
        }
    }, 500);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    
    const themeIcon = document.getElementById('theme-toggle').querySelector('i');
    if (themeIcon) {
        if (document.body.classList.contains('dark-mode')) {
            themeIcon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'dark');
        } else {
            themeIcon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'light');
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const themeIcon = document.getElementById('theme-toggle').querySelector('i');
        if (themeIcon) {
            themeIcon.className = 'fas fa-sun';
        }
    }
});

document.addEventListener('click', function(event) {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('user-dropdown');
    
    if (dropdown && userMenu && !userMenu.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

window.togglePassword = togglePassword;
window.toggleUserMenu = toggleUserMenu;
window.showProfile = showProfile;
window.changePassword = changePassword;
window.logout = logout;
