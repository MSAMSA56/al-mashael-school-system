import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db, { initializeDatabase } from './database.js';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize database
initializeDatabase();

// Types
interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

// Auth Middleware
const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'Server is running' });
});

// Auth Routes
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, phone } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = bcryptjs.hashSync(password, 10);

    // Create user
    const stmt = db.prepare(
      'INSERT INTO users (email, password, first_name, last_name, role, phone) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(email, hashedPassword, firstName, lastName, role, phone || null);

    const user = {
      id: result.lastInsertRowid,
      email,
      firstName,
      lastName,
      role,
    };

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND role = ?').get(email, role);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = bcryptjs.compareSync(password, (user as any).password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: (user as any).id, email: (user as any).email, role: (user as any).role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: (user as any).id,
        email: (user as any).email,
        firstName: (user as any).first_name,
        lastName: (user as any).last_name,
        role: (user as any).role,
        profileImage: (user as any).profile_image,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Routes
app.get('/api/users/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = db.prepare(
      'SELECT id, email, first_name, last_name, role, phone, profile_image FROM users WHERE id = ?'
    ).get(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Students Routes
app.get('/api/students', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const students = db.prepare(`
      SELECT s.*, u.first_name, u.last_name, u.email, u.profile_image
      FROM students s
      JOIN users u ON s.user_id = u.id
      ORDER BY u.first_name
    `).all();

    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Teachers Routes
app.get('/api/teachers', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const teachers = db.prepare(`
      SELECT t.*, u.first_name, u.last_name, u.email, u.profile_image
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      ORDER BY u.first_name
    `).all();

    res.json(teachers);
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Subjects Routes
app.get('/api/subjects', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const subjects = db.prepare('SELECT * FROM subjects ORDER BY name').all();
    res.json(subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/subjects', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin' && req.user?.role !== 'director') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { name, code, description } = req.body;

    const stmt = db.prepare(
      'INSERT INTO subjects (name, code, description) VALUES (?, ?, ?)'
    );
    const result = stmt.run(name, code, description || null);

    res.status(201).json({
      id: result.lastInsertRowid,
      name,
      code,
      description,
    });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Classes Routes
app.get('/api/classes', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const classes = db.prepare('SELECT * FROM classes ORDER BY name').all();
    res.json(classes);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/classes', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin' && req.user?.role !== 'director') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { name, grade, capacity } = req.body;

    const stmt = db.prepare(
      'INSERT INTO classes (name, grade, capacity) VALUES (?, ?, ?)'
    );
    const result = stmt.run(name, grade, capacity || null);

    res.status(201).json({
      id: result.lastInsertRowid,
      name,
      grade,
      capacity,
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assignments Routes
app.get('/api/assignments', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const assignments = db.prepare(`
      SELECT a.*, u.first_name, u.last_name, s.name as subject_name
      FROM assignments a
      JOIN teachers t ON a.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN subjects s ON a.subject_id = s.id
      ORDER BY a.created_at DESC
    `).all();

    res.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/assignments', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can create assignments' });
    }

    const { subjectId, classId, title, description, assignmentLink, dueDate } = req.body;

    // Get teacher ID
    const teacher = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(req.user.id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const stmt = db.prepare(
      'INSERT INTO assignments (teacher_id, subject_id, class_id, title, description, assignment_link, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run((teacher as any).id, subjectId, classId, title, description || null, assignmentLink, dueDate);

    res.status(201).json({
      id: result.lastInsertRowid,
      teacher_id: (teacher as any).id,
      subject_id: subjectId,
      class_id: classId,
      title,
      description,
      assignment_link: assignmentLink,
      due_date: dueDate,
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Exams Routes
app.get('/api/exams', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const exams = db.prepare(`
      SELECT e.*, u.first_name, u.last_name, s.name as subject_name
      FROM exams e
      JOIN teachers t ON e.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN subjects s ON e.subject_id = s.id
      ORDER BY e.created_at DESC
    `).all();

    res.json(exams);
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/exams', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can create exams' });
    }

    const { subjectId, classId, title, description, examLink, startDate, endDate } = req.body;

    // Get teacher ID
    const teacher = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(req.user.id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const stmt = db.prepare(
      'INSERT INTO exams (teacher_id, subject_id, class_id, title, description, exam_link, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run((teacher as any).id, subjectId, classId, title, description || null, examLink, startDate, endDate);

    res.status(201).json({
      id: result.lastInsertRowid,
      teacher_id: (teacher as any).id,
      subject_id: subjectId,
      class_id: classId,
      title,
      description,
      exam_link: examLink,
      start_date: startDate,
      end_date: endDate,
    });
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Attendance Routes
app.get('/api/attendance', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const attendance = db.prepare(`
      SELECT a.*, u.first_name, u.last_name
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      ORDER BY a.date DESC
    `).all();

    res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/attendance', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { studentId, classId, date, status, notes } = req.body;

    let recordedBy = null;
    if (req.user?.role === 'teacher') {
      const teacher = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(req.user.id);
      if (teacher) {
        recordedBy = (teacher as any).id;
      }
    }

    const stmt = db.prepare(
      'INSERT INTO attendance (student_id, class_id, date, status, notes, recorded_by) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(studentId, classId, date, status, notes || null, recordedBy);

    res.status(201).json({
      id: result.lastInsertRowid,
      student_id: studentId,
      class_id: classId,
      date,
      status,
      notes,
      recorded_by: recordedBy,
    });
  } catch (error) {
    console.error('Create attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Messages Routes
app.get('/api/messages', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const messages = db.prepare(`
      SELECT m.*, 
             u1.first_name as sender_first_name, u1.last_name as sender_last_name,
             u2.first_name as receiver_first_name, u2.last_name as receiver_last_name
      FROM messages m
      JOIN users u1 ON m.sender_id = u1.id
      JOIN users u2 ON m.receiver_id = u2.id
      WHERE m.receiver_id = ? OR m.sender_id = ?
      ORDER BY m.created_at DESC
    `).all(req.user?.id, req.user?.id);

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/messages', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { receiverId, subject, content } = req.body;

    const stmt = db.prepare(
      'INSERT INTO messages (sender_id, receiver_id, subject, content) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(req.user?.id, receiverId, subject || null, content);

    res.status(201).json({
      id: result.lastInsertRowid,
      sender_id: req.user?.id,
      receiver_id: receiverId,
      subject,
      content,
    });
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Meetings Routes
app.get('/api/meetings', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const meetings = db.prepare(`
      SELECT m.*, u.first_name, u.last_name
      FROM meetings m
      JOIN users u ON m.created_by = u.id
      ORDER BY m.meeting_date DESC
    `).all();

    res.json(meetings);
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/meetings', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'director' && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Only directors and admins can create meetings' });
    }

    const { title, description, meetingDate, meetingLink } = req.body;

    const stmt = db.prepare(
      'INSERT INTO meetings (created_by, title, description, meeting_date, meeting_link) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(req.user?.id, title, description || null, meetingDate, meetingLink || null);

    res.status(201).json({
      id: result.lastInsertRowid,
      created_by: req.user?.id,
      title,
      description,
      meeting_date: meetingDate,
      meeting_link: meetingLink,
    });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
  console.log(`📍 الرابط: http://localhost:${PORT}`);
});

export default app;
