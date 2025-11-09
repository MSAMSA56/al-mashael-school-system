import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import '../styles/Dashboard.css';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

const AdminDashboard: React.FC = () => {
  const { user, token } = useAuthStore();
  const { isDark, language } = useThemeStore();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'classes' | 'subjects' | 'attendance' | 'reports'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserFirstName, setNewUserFirstName] = useState('');
  const [newUserLastName, setNewUserLastName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState('first_secondary');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, { headers });
        
        if (response.ok) {
          // Fetch users from a dedicated endpoint or get them from other sources
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newClassName,
          grade: newClassGrade,
        }),
      });

      if (response.ok) {
        setNewClassName('');
        alert('تم إنشاء الفصل بنجاح');
      }
    } catch (error) {
      console.error('Error creating class:', error);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newSubjectName,
          code: newSubjectCode,
        }),
      });

      if (response.ok) {
        setNewSubjectName('');
        setNewSubjectCode('');
        alert('تم إنشاء المادة بنجاح');
      }
    } catch (error) {
      console.error('Error creating subject:', error);
    }
  };

  const translations = {
    ar: {
      overview: 'نظرة عامة',
      users: 'المستخدمون',
      classes: 'الفصول',
      subjects: 'المواد',
      attendance: 'الحضور والغياب',
      reports: 'التقارير',
      welcome: 'أهلاً وسهلاً',
      createClass: 'إنشاء فصل جديد',
      createSubject: 'إنشاء مادة جديدة',
      className: 'اسم الفصل',
      grade: 'المرحلة',
      subjectName: 'اسم المادة',
      subjectCode: 'رمز المادة',
      create: 'إنشاء',
      email: 'البريد الإلكتروني',
      firstName: 'الاسم الأول',
      lastName: 'الاسم الأخير',
      role: 'الدور',
      totalUsers: 'إجمالي المستخدمين',
      totalClasses: 'إجمالي الفصول',
      totalSubjects: 'إجمالي المواد',
    },
    en: {
      overview: 'Overview',
      users: 'Users',
      classes: 'Classes',
      subjects: 'Subjects',
      attendance: 'Attendance',
      reports: 'Reports',
      welcome: 'Welcome',
      createClass: 'Create New Class',
      createSubject: 'Create New Subject',
      className: 'Class Name',
      grade: 'Grade',
      subjectName: 'Subject Name',
      subjectCode: 'Subject Code',
      create: 'Create',
      email: 'Email',
      firstName: 'First Name',
      lastName: 'Last Name',
      role: 'Role',
      totalUsers: 'Total Users',
      totalClasses: 'Total Classes',
      totalSubjects: 'Total Subjects',
    },
  };

  const t = translations[language];

  if (isLoading) {
    return <div className="dashboard-loading">جاري التحميل...</div>;
  }

  return (
    <div className={`dashboard ${isDark ? 'dark' : 'light'}`}>
      <div className="dashboard-container">
        {/* Sidebar Navigation */}
        <nav className="dashboard-sidebar">
          <div className="sidebar-header">
            <h2>{t.welcome}</h2>
            <p>{user?.firstName} {user?.lastName}</p>
          </div>

          <ul className="nav-list">
            {(['overview', 'users', 'classes', 'subjects', 'attendance', 'reports'] as const).map((tab) => (
              <li key={tab}>
                <button
                  className={`nav-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'overview' && '📊'}
                  {tab === 'users' && '👥'}
                  {tab === 'classes' && '📚'}
                  {tab === 'subjects' && '📖'}
                  {tab === 'attendance' && '✓'}
                  {tab === 'reports' && '📈'}
                  <span>{t[tab]}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main Content */}
        <main className="dashboard-main">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="tab-content">
              <h1>نظرة عامة</h1>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-info">
                    <h3>0</h3>
                    <p>{t.totalUsers}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📚</div>
                  <div className="stat-info">
                    <h3>0</h3>
                    <p>{t.totalClasses}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📖</div>
                  <div className="stat-info">
                    <h3>0</h3>
                    <p>{t.totalSubjects}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Classes Tab */}
          {activeTab === 'classes' && (
            <div className="tab-content">
              <h1>{t.classes}</h1>
              <form onSubmit={handleCreateClass} className="form-card">
                <h2>{t.createClass}</h2>
                
                <div className="form-group">
                  <label>{t.className}</label>
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t.grade}</label>
                  <select
                    value={newClassGrade}
                    onChange={(e) => setNewClassGrade(e.target.value)}
                  >
                    <option value="first_secondary">الأول الثانوي</option>
                    <option value="second_secondary">الثاني الثانوي</option>
                    <option value="third_secondary">الثالث الثانوي</option>
                    <option value="first_intermediate">الأول المتوسط</option>
                    <option value="second_intermediate">الثاني المتوسط</option>
                    <option value="third_intermediate">الثالث المتوسط</option>
                  </select>
                </div>

                <button type="submit" className="btn-primary">{t.create}</button>
              </form>
            </div>
          )}

          {/* Subjects Tab */}
          {activeTab === 'subjects' && (
            <div className="tab-content">
              <h1>{t.subjects}</h1>
              <form onSubmit={handleCreateSubject} className="form-card">
                <h2>{t.createSubject}</h2>
                
                <div className="form-group">
                  <label>{t.subjectName}</label>
                  <input
                    type="text"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t.subjectCode}</label>
                  <input
                    type="text"
                    value={newSubjectCode}
                    onChange={(e) => setNewSubjectCode(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary">{t.create}</button>
              </form>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="tab-content">
              <h1>{t.users}</h1>
              <div className="users-list">
                {users.length === 0 ? (
                  <p className="empty-message">لا توجد مستخدمون</p>
                ) : (
                  users.map((u) => (
                    <div key={u.id} className="user-item">
                      <h4>{u.first_name} {u.last_name}</h4>
                      <p>{u.email}</p>
                      <span className="role-badge">{u.role}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div className="tab-content">
              <h1>{t.attendance}</h1>
              <p>سيتم إضافة نظام الحضور والغياب قريباً</p>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="tab-content">
              <h1>{t.reports}</h1>
              <p>سيتم إضافة التقارير التحليلية قريباً</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
