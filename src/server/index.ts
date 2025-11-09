import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, phone } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password, first_name, last_name, role, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, role',
      [email, hashedPassword, firstName, lastName, role, phone || null]
    );

    const user = result.rows[0];

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

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND role = $2', [email, role]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        profileImage: user.profile_image,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Routes
app.get('/api/users/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, role, phone, profile_image FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Students Routes
app.get('/api/students', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT s.*, u.first_name, u.last_name, u.email, u.profile_image
      FROM students s
      JOIN users u ON s.user_id = u.id
      ORDER BY u.first_name
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Teachers Routes
app.get('/api/teachers', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT t.*, u.first_name, u.last_name, u.email, u.profile_image
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      ORDER BY u.first_name
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Subjects Routes
app.get('/api/subjects', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM subjects ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/subjects', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin' && req.user?.role !== 'director') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { name, code, description } = req.body;

    const result = await pool.query(
      'INSERT INTO subjects (name, code, description) VALUES ($1, $2, $3) RETURNING *',
      [name, code, description || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Classes Routes
app.get('/api/classes', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM classes ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/classes', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin' && req.user?.role !== 'director') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { name, grade, capacity } = req.body;

    const result = await pool.query(
      'INSERT INTO classes (name, grade, capacity) VALUES ($1, $2, $3) RETURNING *',
      [name, grade, capacity || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assignments Routes
app.get('/api/assignments', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT a.*, u.first_name, u.last_name, s.name as subject_name
      FROM assignments a
      JOIN teachers t ON a.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN subjects s ON a.subject_id = s.id
      ORDER BY a.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/assignments', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can create assignments' });
    }

    const { subjectId, classId, title, description, assignmentLink, dueDate } = req.body;

    // Get teacher ID
    const teacherResult = await pool.query('SELECT id FROM teachers WHERE user_id = $1', [req.user.id]);
    if (teacherResult.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const teacherId = teacherResult.rows[0].id;

    const result = await pool.query(
      'INSERT INTO assignments (teacher_id, subject_id, class_id, title, description, assignment_link, due_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [teacherId, subjectId, classId, title, description || null, assignmentLink, dueDate]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Exams Routes
app.get('/api/exams', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT e.*, u.first_name, u.last_name, s.name as subject_name
      FROM exams e
      JOIN teachers t ON e.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN subjects s ON e.subject_id = s.id
      ORDER BY e.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/exams', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can create exams' });
    }

    const { subjectId, classId, title, description, examLink, startDate, endDate } = req.body;

    // Get teacher ID
    const teacherResult = await pool.query('SELECT id FROM teachers WHERE user_id = $1', [req.user.id]);
    if (teacherResult.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const teacherId = teacherResult.rows[0].id;

    const result = await pool.query(
      'INSERT INTO exams (teacher_id, subject_id, class_id, title, description, exam_link, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [teacherId, subjectId, classId, title, description || null, examLink, startDate, endDate]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Attendance Routes
app.get('/api/attendance', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT a.*, u.first_name, u.last_name
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      ORDER BY a.date DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/attendance', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { studentId, classId, date, status, notes } = req.body;

    let recordedBy = null;
    if (req.user?.role === 'teacher') {
      const teacherResult = await pool.query('SELECT id FROM teachers WHERE user_id = $1', [req.user.id]);
      if (teacherResult.rows.length > 0) {
        recordedBy = teacherResult.rows[0].id;
      }
    }

    const result = await pool.query(
      'INSERT INTO attendance (student_id, class_id, date, status, notes, recorded_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [studentId, classId, date, status, notes || null, recordedBy]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Messages Routes
app.get('/api/messages', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT m.*, 
             u1.first_name as sender_first_name, u1.last_name as sender_last_name,
             u2.first_name as receiver_first_name, u2.last_name as receiver_last_name
      FROM messages m
      JOIN users u1 ON m.sender_id = u1.id
      JOIN users u2 ON m.receiver_id = u2.id
      WHERE m.receiver_id = $1 OR m.sender_id = $1
      ORDER BY m.created_at DESC
    `, [req.user?.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/messages', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { receiverId, subject, content } = req.body;

    const result = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, subject, content) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user?.id, receiverId, subject || null, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Meetings Routes
app.get('/api/meetings', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT m.*, u.first_name, u.last_name
      FROM meetings m
      JOIN users u ON m.created_by = u.id
      ORDER BY m.meeting_date DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/meetings', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'director' && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Only directors and admins can create meetings' });
    }

    const { title, description, meetingDate, meetingLink } = req.body;

    const result = await pool.query(
      'INSERT INTO meetings (created_by, title, description, meeting_date, meeting_link) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user?.id, title, description || null, meetingDate, meetingLink || null]
    );

    res.status(201).json(result.rows[0]);
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
  console.log(`Server is running on port ${PORT}`);
});

export default app;
