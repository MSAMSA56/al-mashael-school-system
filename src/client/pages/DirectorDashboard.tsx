import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import '../styles/Dashboard.css';

interface Meeting {
  id: number;
  title: string;
  description: string;
  meeting_date: string;
  first_name: string;
  last_name: string;
}

const DirectorDashboard: React.FC = () => {
  const { user, token } = useAuthStore();
  const { isDark, language } = useThemeStore();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'meetings' | 'analytics' | 'reports' | 'settings'>('overview');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDescription, setMeetingDescription] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/meetings`, { headers });
        
        if (response.ok) {
          setMeetings(await response.json());
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const meetingDateTime = new Date(`${meetingDate}T${meetingTime}`);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: meetingTitle,
          description: meetingDescription,
          meetingDate: meetingDateTime.toISOString(),
        }),
      });

      if (response.ok) {
        setMeetingTitle('');
        setMeetingDescription('');
        setMeetingDate('');
        setMeetingTime('');
        alert('تم إنشاء الاجتماع بنجاح');
        // Refresh meetings list
        const meetingsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/meetings`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (meetingsRes.ok) {
          setMeetings(await meetingsRes.json());
        }
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  const translations = {
    ar: {
      overview: 'نظرة عامة',
      meetings: 'الاجتماعات',
      analytics: 'التحليلات',
      reports: 'التقارير',
      settings: 'الإعدادات',
      welcome: 'أهلاً وسهلاً',
      createMeeting: 'جدولة اجتماع جديد',
      meetingTitle: 'عنوان الاجتماع',
      meetingDescription: 'وصف الاجتماع',
      meetingDate: 'تاريخ الاجتماع',
      meetingTime: 'وقت الاجتماع',
      create: 'إنشاء',
      noMeetings: 'لا توجد اجتماعات',
      totalMeetings: 'إجمالي الاجتماعات',
      upcomingMeetings: 'الاجتماعات القادمة',
      pastMeetings: 'الاجتماعات السابقة',
      directorDashboard: 'لوحة تحكم المدير',
      sendNotification: 'إرسال إشعار',
      notifyTeachers: 'إخطار المعلمين',
      notifyAdmin: 'إخطار الإدارة',
    },
    en: {
      overview: 'Overview',
      meetings: 'Meetings',
      analytics: 'Analytics',
      reports: 'Reports',
      settings: 'Settings',
      welcome: 'Welcome',
      createMeeting: 'Schedule New Meeting',
      meetingTitle: 'Meeting Title',
      meetingDescription: 'Meeting Description',
      meetingDate: 'Meeting Date',
      meetingTime: 'Meeting Time',
      create: 'Create',
      noMeetings: 'No meetings',
      totalMeetings: 'Total Meetings',
      upcomingMeetings: 'Upcoming Meetings',
      pastMeetings: 'Past Meetings',
      directorDashboard: 'Director Dashboard',
      sendNotification: 'Send Notification',
      notifyTeachers: 'Notify Teachers',
      notifyAdmin: 'Notify Admin',
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
        <nav className="dashboard-sidebar director-sidebar">
          <div className="sidebar-header director-header">
            <div className="director-badge">⭐</div>
            <h2>{t.welcome}</h2>
            <p>{user?.firstName} {user?.lastName}</p>
          </div>

          <ul className="nav-list">
            {(['overview', 'meetings', 'analytics', 'reports', 'settings'] as const).map((tab) => (
              <li key={tab}>
                <button
                  className={`nav-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'overview' && '📊'}
                  {tab === 'meetings' && '📞'}
                  {tab === 'analytics' && '📈'}
                  {tab === 'reports' && '📋'}
                  {tab === 'settings' && '⚙️'}
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
              <h1>{t.directorDashboard}</h1>
              <div className="stats-grid">
                <div className="stat-card director-stat">
                  <div className="stat-icon">📞</div>
                  <div className="stat-info">
                    <h3>{meetings.length}</h3>
                    <p>{t.totalMeetings}</p>
                  </div>
                </div>
                <div className="stat-card director-stat">
                  <div className="stat-icon">📅</div>
                  <div className="stat-info">
                    <h3>{meetings.filter(m => new Date(m.meeting_date) > new Date()).length}</h3>
                    <p>{t.upcomingMeetings}</p>
                  </div>
                </div>
                <div className="stat-card director-stat">
                  <div className="stat-icon">✓</div>
                  <div className="stat-info">
                    <h3>{meetings.filter(m => new Date(m.meeting_date) <= new Date()).length}</h3>
                    <p>{t.pastMeetings}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Meetings Tab */}
          {activeTab === 'meetings' && (
            <div className="tab-content">
              <h1>{t.meetings}</h1>
              <form onSubmit={handleCreateMeeting} className="form-card director-form">
                <h2>{t.createMeeting}</h2>
                
                <div className="form-group">
                  <label>{t.meetingTitle}</label>
                  <input
                    type="text"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t.meetingDescription}</label>
                  <textarea
                    value={meetingDescription}
                    onChange={(e) => setMeetingDescription(e.target.value)}
                    rows={4}
                  ></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t.meetingDate}</label>
                    <input
                      type="date"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{t.meetingTime}</label>
                    <input
                      type="time"
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">{t.create}</button>
                  <button type="button" className="btn-secondary">{t.sendNotification}</button>
                </div>
              </form>

              <div className="meetings-list">
                <h2>الاجتماعات المجدولة</h2>
                {meetings.length === 0 ? (
                  <p className="empty-message">{t.noMeetings}</p>
                ) : (
                  meetings.map((meeting) => (
                    <div key={meeting.id} className="meeting-item">
                      <div className="meeting-header">
                        <h3>{meeting.title}</h3>
                        <span className="meeting-date">
                          {new Date(meeting.meeting_date).toLocaleDateString('ar-SA')} - {new Date(meeting.meeting_date).toLocaleTimeString('ar-SA')}
                        </span>
                      </div>
                      {meeting.description && <p className="meeting-description">{meeting.description}</p>}
                      <p className="meeting-organizer">منظم الاجتماع: {meeting.first_name} {meeting.last_name}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="tab-content">
              <h1>{t.analytics}</h1>
              <div className="analytics-placeholder">
                <p>سيتم إضافة التحليلات المتقدمة قريباً</p>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="tab-content">
              <h1>{t.reports}</h1>
              <div className="reports-placeholder">
                <p>سيتم إضافة التقارير الشاملة قريباً</p>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="tab-content">
              <h1>{t.settings}</h1>
              <div className="settings-placeholder">
                <p>سيتم إضافة الإعدادات قريباً</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DirectorDashboard;
