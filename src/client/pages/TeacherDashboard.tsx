import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import '../styles/Dashboard.css';

interface Class {
  id: number;
  name: string;
  grade: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;
}

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  grade: string;
  class: string;
  profile_image?: string;
}

const TeacherDashboard: React.FC = () => {
  const { user, token } = useAuthStore();
  const { isDark, language } = useThemeStore();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'exams' | 'attendance' | 'students' | 'schedule'>('overview');
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentLink, setAssignmentLink] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [examLink, setExamLink] = useState('');
  const [examStartDate, setExamStartDate] = useState('');
  const [examEndDate, setExamEndDate] = useState('');
  const [scheduleImage, setScheduleImage] = useState<File | null>(null);
  const [scheduleZoom, setScheduleZoom] = useState(100);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        const headers = { 'Authorization': `Bearer ${token}` };

        const [classesRes, subjectsRes, studentsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/classes`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/subjects`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/api/students`, { headers }),
        ]);

        if (classesRes.ok) setClasses(await classesRes.json());
        if (subjectsRes.ok) setSubjects(await subjectsRes.json());
        if (studentsRes.ok) setStudents(await studentsRes.json());
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedClass || !selectedSubject) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          subjectId: selectedSubject,
          classId: selectedClass,
          title: assignmentTitle,
          assignmentLink,
          dueDate: assignmentDueDate,
        }),
      });

      if (response.ok) {
        setAssignmentTitle('');
        setAssignmentLink('');
        setAssignmentDueDate('');
        alert('تم إنشاء الواجب بنجاح');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedClass || !selectedSubject) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/exams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          subjectId: selectedSubject,
          classId: selectedClass,
          title: examTitle,
          examLink,
          startDate: examStartDate,
          endDate: examEndDate,
        }),
      });

      if (response.ok) {
        setExamTitle('');
        setExamLink('');
        setExamStartDate('');
        setExamEndDate('');
        alert('تم إنشاء الاختبار بنجاح');
      }
    } catch (error) {
      console.error('Error creating exam:', error);
    }
  };

  const translations = {
    ar: {
      overview: 'نظرة عامة',
      assignments: 'الواجبات',
      exams: 'الاختبارات',
      attendance: 'الحضور والغياب',
      students: 'الطلاب',
      schedule: 'الجدول الزمني',
      welcome: 'أهلاً وسهلاً',
      createAssignment: 'إنشاء واجب جديد',
      createExam: 'إنشاء اختبار جديد',
      selectClass: 'اختر الفصل',
      selectSubject: 'اختر المادة',
      title: 'العنوان',
      link: 'الرابط',
      dueDate: 'تاريخ الاستحقاق',
      startDate: 'تاريخ البداية',
      endDate: 'تاريخ النهاية',
      create: 'إنشاء',
      uploadSchedule: 'تحميل الجدول',
      zoomIn: 'تكبير',
      zoomOut: 'تصغير',
      noStudents: 'لا توجد طلاب',
      noClasses: 'لا توجد فصول',
      noSubjects: 'لا توجد مواد',
    },
    en: {
      overview: 'Overview',
      assignments: 'Assignments',
      exams: 'Exams',
      attendance: 'Attendance',
      students: 'Students',
      schedule: 'Schedule',
      welcome: 'Welcome',
      createAssignment: 'Create New Assignment',
      createExam: 'Create New Exam',
      selectClass: 'Select Class',
      selectSubject: 'Select Subject',
      title: 'Title',
      link: 'Link',
      dueDate: 'Due Date',
      startDate: 'Start Date',
      endDate: 'End Date',
      create: 'Create',
      uploadSchedule: 'Upload Schedule',
      zoomIn: 'Zoom In',
      zoomOut: 'Zoom Out',
      noStudents: 'No students',
      noClasses: 'No classes',
      noSubjects: 'No subjects',
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
            {(['overview', 'assignments', 'exams', 'attendance', 'students', 'schedule'] as const).map((tab) => (
              <li key={tab}>
                <button
                  className={`nav-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'overview' && '📊'}
                  {tab === 'assignments' && '📝'}
                  {tab === 'exams' && '✏️'}
                  {tab === 'attendance' && '✓'}
                  {tab === 'students' && '👨‍🎓'}
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
                    <h3>{subjects.length}</h3>
                    <p>مواد</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👨‍🎓</div>
                  <div className="stat-info">
                    <h3>{students.length}</h3>
                    <p>طالب</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📚</div>
                  <div className="stat-info">
                    <h3>{classes.length}</h3>
                    <p>فصل</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
            <div className="tab-content">
              <h1>{t.assignments}</h1>
              <form onSubmit={handleCreateAssignment} className="form-card">
                <h2>{t.createAssignment}</h2>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>{t.selectClass}</label>
                    <select
                      value={selectedClass || ''}
                      onChange={(e) => setSelectedClass(Number(e.target.value))}
                      required
                    >
                      <option value="">اختر فصل</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{t.selectSubject}</label>
                    <select
                      value={selectedSubject || ''}
                      onChange={(e) => setSelectedSubject(Number(e.target.value))}
                      required
                    >
                      <option value="">اختر مادة</option>
                      {subjects.map((subj) => (
                        <option key={subj.id} value={subj.id}>{subj.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>{t.title}</label>
                  <input
                    type="text"
                    value={assignmentTitle}
                    onChange={(e) => setAssignmentTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t.link}</label>
                  <input
                    type="url"
                    value={assignmentLink}
                    onChange={(e) => setAssignmentLink(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t.dueDate}</label>
                  <input
                    type="datetime-local"
                    value={assignmentDueDate}
                    onChange={(e) => setAssignmentDueDate(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary">{t.create}</button>
              </form>
            </div>
          )}

          {/* Exams Tab */}
          {activeTab === 'exams' && (
            <div className="tab-content">
              <h1>{t.exams}</h1>
              <form onSubmit={handleCreateExam} className="form-card">
                <h2>{t.createExam}</h2>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>{t.selectClass}</label>
                    <select
                      value={selectedClass || ''}
                      onChange={(e) => setSelectedClass(Number(e.target.value))}
                      required
                    >
                      <option value="">اختر فصل</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{t.selectSubject}</label>
                    <select
                      value={selectedSubject || ''}
                      onChange={(e) => setSelectedSubject(Number(e.target.value))}
                      required
                    >
                      <option value="">اختر مادة</option>
                      {subjects.map((subj) => (
                        <option key={subj.id} value={subj.id}>{subj.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>{t.title}</label>
                  <input
                    type="text"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t.link}</label>
                  <input
                    type="url"
                    value={examLink}
                    onChange={(e) => setExamLink(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t.startDate}</label>
                    <input
                      type="datetime-local"
                      value={examStartDate}
                      onChange={(e) => setExamStartDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{t.endDate}</label>
                    <input
                      type="datetime-local"
                      value={examEndDate}
                      onChange={(e) => setExamEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary">{t.create}</button>
              </form>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <div className="tab-content">
              <h1>{t.students}</h1>
              {students.length === 0 ? (
                <p className="empty-message">{t.noStudents}</p>
              ) : (
                <div className="students-grid">
                  {students.map((student) => (
                    <div key={student.id} className="student-card">
                      <div className="student-avatar">
                        {student.profile_image ? (
                          <img src={student.profile_image} alt={student.first_name} />
                        ) : (
                          <div className="avatar-placeholder">👨‍🎓</div>
                        )}
                      </div>
                      <h3>{student.first_name} {student.last_name}</h3>
                      <p className="student-class">{student.class}</p>
                      <div className="student-actions">
                        <button className="action-btn">📧 رسالة</button>
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
              <div className="schedule-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setScheduleImage(e.target.files?.[0] || null)}
                />
                <button className="btn-primary">{t.uploadSchedule}</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;
