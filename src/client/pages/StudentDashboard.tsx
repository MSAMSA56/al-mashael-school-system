import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import '../styles/Dashboard.css';

interface Assignment {
  id: number;
  title: string;
  description: string;
  assignment_link: string;
  due_date: string;
  sender_first_name: string;
  sender_last_name: string;
  subject_name: string;
  isSubmitted?: boolean;
}

interface Exam {
  id: number;
  title: string;
  description: string;
  exam_link: string;
  start_date: string;
  end_date: string;
  sender_first_name: string;
  sender_last_name: string;
  subject_name: string;
  isCompleted?: boolean;
}

interface Message {
  id: number;
  sender_first_name: string;
  sender_last_name: string;
  subject: string;
  content: string;
  created_at: string;
}

interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  specialization: string;
  profile_image?: string;
}

const StudentDashboard: React.FC = () => {
  const { user, token } = useAuthStore();
  const { isDark, language } = useThemeStore();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'exams' | 'messages' | 'teachers' | 'schedule'>('overview');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scheduleImage, setScheduleImage] = useState<string | null>(null);
  const [scheduleZoom, setScheduleZoom] = useState(100);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        const headers = { 'Authorization': `Bearer ${token}` };

        const [assignmentsRes, examsRes, messagesRes, teachersRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/assignments`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/exams`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/messages`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/teachers`, { headers }),
        ]);

        if (assignmentsRes.ok) setAssignments(await assignmentsRes.json());
        if (examsRes.ok) setExams(await examsRes.json());
        if (messagesRes.ok) setMessages(await messagesRes.json());
        if (teachersRes.ok) setTeachers(await teachersRes.json());
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const translations = {
    ar: {
      overview: 'نظرة عامة',
      assignments: 'الواجبات',
      exams: 'الاختبارات',
      messages: 'الرسائل',
      teachers: 'المعلمون',
      schedule: 'الجدول الزمني',
      noAssignments: 'لا توجد واجبات حالياً',
      noExams: 'لا توجد اختبارات حالياً',
      noMessages: 'لا توجد رسائل',
      noTeachers: 'لا توجد معلمون',
      dueDate: 'تاريخ الاستحقاق',
      from: 'من',
      subject: 'الموضوع',
      content: 'المحتوى',
      openLink: 'فتح الرابط',
      submitted: 'تم التسليم',
      notSubmitted: 'لم يتم التسليم',
      completed: 'مكتمل',
      notCompleted: 'لم يكتمل',
      specialization: 'التخصص',
      contactInfo: 'معلومات التواصل',
      zoomIn: 'تكبير',
      zoomOut: 'تصغير',
      uploadSchedule: 'تحميل الجدول',
      welcome: 'أهلاً وسهلاً',
    },
    en: {
      overview: 'Overview',
      assignments: 'Assignments',
      exams: 'Exams',
      messages: 'Messages',
      teachers: 'Teachers',
      schedule: 'Schedule',
      noAssignments: 'No assignments yet',
      noExams: 'No exams yet',
      noMessages: 'No messages',
      noTeachers: 'No teachers',
      dueDate: 'Due Date',
      from: 'From',
      subject: 'Subject',
      content: 'Content',
      openLink: 'Open Link',
      submitted: 'Submitted',
      notSubmitted: 'Not Submitted',
      completed: 'Completed',
      notCompleted: 'Not Completed',
      specialization: 'Specialization',
      contactInfo: 'Contact Info',
      zoomIn: 'Zoom In',
      zoomOut: 'Zoom Out',
      uploadSchedule: 'Upload Schedule',
      welcome: 'Welcome',
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
            {(['overview', 'assignments', 'exams', 'messages', 'teachers', 'schedule'] as const).map((tab) => (
              <li key={tab}>
                <button
                  className={`nav-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'overview' && '📊'}
                  {tab === 'assignments' && '📝'}
                  {tab === 'exams' && '✏️'}
                  {tab === 'messages' && '💬'}
                  {tab === 'teachers' && '👨‍🏫'}
                  {tab === 'schedule' && '📅'}
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
                  <div className="stat-icon">📝</div>
                  <div className="stat-info">
                    <h3>{assignments.length}</h3>
                    <p>واجبات</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">✏️</div>
                  <div className="stat-info">
                    <h3>{exams.length}</h3>
                    <p>اختبارات</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💬</div>
                  <div className="stat-info">
                    <h3>{messages.length}</h3>
                    <p>رسائل</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👨‍🏫</div>
                  <div className="stat-info">
                    <h3>{teachers.length}</h3>
                    <p>معلمون</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
            <div className="tab-content">
              <h1>{t.assignments}</h1>
              {assignments.length === 0 ? (
                <p className="empty-message">{t.noAssignments}</p>
              ) : (
                <div className="items-grid">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="item-card">
                      <div className="item-header">
                        <h3>{assignment.title}</h3>
                        <span className={`status-badge ${assignment.isSubmitted ? 'submitted' : 'pending'}`}>
                          {assignment.isSubmitted ? t.submitted : t.notSubmitted}
                        </span>
                      </div>
                      <p className="item-description">{assignment.description}</p>
                      <div className="item-meta">
                        <p><strong>{t.from}:</strong> {assignment.sender_first_name} {assignment.sender_last_name}</p>
                        <p><strong>{t.subject}:</strong> {assignment.subject_name}</p>
                        <p><strong>{t.dueDate}:</strong> {new Date(assignment.due_date).toLocaleDateString('ar-SA')}</p>
                      </div>
                      <a href={assignment.assignment_link} target="_blank" rel="noopener noreferrer" className="item-link">
                        {t.openLink} →
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Exams Tab */}
          {activeTab === 'exams' && (
            <div className="tab-content">
              <h1>{t.exams}</h1>
              {exams.length === 0 ? (
                <p className="empty-message">{t.noExams}</p>
              ) : (
                <div className="items-grid">
                  {exams.map((exam) => (
                    <div key={exam.id} className="item-card">
                      <div className="item-header">
                        <h3>{exam.title}</h3>
                        <span className={`status-badge ${exam.isCompleted ? 'completed' : 'pending'}`}>
                          {exam.isCompleted ? t.completed : t.notCompleted}
                        </span>
                      </div>
                      <p className="item-description">{exam.description}</p>
                      <div className="item-meta">
                        <p><strong>{t.from}:</strong> {exam.sender_first_name} {exam.sender_last_name}</p>
                        <p><strong>{t.subject}:</strong> {exam.subject_name}</p>
                        <p><strong>من:</strong> {new Date(exam.start_date).toLocaleDateString('ar-SA')} إلى {new Date(exam.end_date).toLocaleDateString('ar-SA')}</p>
                      </div>
                      <a href={exam.exam_link} target="_blank" rel="noopener noreferrer" className="item-link">
                        {t.openLink} →
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="tab-content">
              <h1>{t.messages}</h1>
              {messages.length === 0 ? (
                <p className="empty-message">{t.noMessages}</p>
              ) : (
                <div className="messages-list">
                  {messages.map((message) => (
                    <div key={message.id} className="message-item">
                      <div className="message-header">
                        <h4>{message.sender_first_name} {message.sender_last_name}</h4>
                        <span className="message-date">{new Date(message.created_at).toLocaleDateString('ar-SA')}</span>
                      </div>
                      {message.subject && <p className="message-subject"><strong>{t.subject}:</strong> {message.subject}</p>}
                      <p className="message-content">{message.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Teachers Tab */}
          {activeTab === 'teachers' && (
            <div className="tab-content">
              <h1>{t.teachers}</h1>
              {teachers.length === 0 ? (
                <p className="empty-message">{t.noTeachers}</p>
              ) : (
                <div className="teachers-grid">
                  {teachers.map((teacher) => (
                    <div key={teacher.id} className="teacher-card">
                      <div className="teacher-avatar">
                        {teacher.profile_image ? (
                          <img src={teacher.profile_image} alt={teacher.first_name} />
                        ) : (
                          <div className="avatar-placeholder">👨‍🏫</div>
                        )}
                      </div>
                      <h3>{teacher.first_name} {teacher.last_name}</h3>
                      <p className="teacher-specialization">{teacher.specialization}</p>
                      <div className="teacher-contact">
                        <button className="contact-btn">📧 {t.contactInfo}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="tab-content">
              <h1>{t.schedule}</h1>
              <div className="schedule-container">
                {scheduleImage ? (
                  <div className="schedule-viewer">
                    <div className="schedule-controls">
                      <button onClick={() => setScheduleZoom(Math.max(50, scheduleZoom - 10))}>{t.zoomOut}</button>
                      <span>{scheduleZoom}%</span>
                      <button onClick={() => setScheduleZoom(Math.min(200, scheduleZoom + 10))}>{t.zoomIn}</button>
                    </div>
                    <div className="schedule-image-wrapper" style={{ transform: `scale(${scheduleZoom / 100})` }}>
                      <img src={scheduleImage} alt="Schedule" />
                    </div>
                  </div>
                ) : (
                  <div className="schedule-placeholder">
                    <p>لم يتم تحميل جدول زمني بعد</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
