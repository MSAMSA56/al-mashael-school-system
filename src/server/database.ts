import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../al_mashael_school.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initializeDatabase() {
  // Create ENUM-like tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS role_enum (
      value TEXT PRIMARY KEY
    );
    
    INSERT OR IGNORE INTO role_enum VALUES ('student');
    INSERT OR IGNORE INTO role_enum VALUES ('teacher');
    INSERT OR IGNORE INTO role_enum VALUES ('admin');
    INSERT OR IGNORE INTO role_enum VALUES ('director');
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS grade_enum (
      value TEXT PRIMARY KEY
    );
    
    INSERT OR IGNORE INTO grade_enum VALUES ('first_secondary');
    INSERT OR IGNORE INTO grade_enum VALUES ('second_secondary');
    INSERT OR IGNORE INTO grade_enum VALUES ('third_secondary');
    INSERT OR IGNORE INTO grade_enum VALUES ('first_intermediate');
    INSERT OR IGNORE INTO grade_enum VALUES ('second_intermediate');
    INSERT OR IGNORE INTO grade_enum VALUES ('third_intermediate');
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance_status_enum (
      value TEXT PRIMARY KEY
    );
    
    INSERT OR IGNORE INTO attendance_status_enum VALUES ('present');
    INSERT OR IGNORE INTO attendance_status_enum VALUES ('absent');
    INSERT OR IGNORE INTO attendance_status_enum VALUES ('late');
  `);

  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'teacher', 'admin', 'director')),
      phone TEXT,
      profile_image TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create students table
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      student_id TEXT UNIQUE NOT NULL,
      grade TEXT NOT NULL,
      class TEXT NOT NULL,
      enrollment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  // Create teachers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      teacher_id TEXT UNIQUE NOT NULL,
      specialization TEXT NOT NULL,
      join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  // Create subjects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create classes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      grade TEXT NOT NULL,
      capacity INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create teacher_subjects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS teacher_subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL,
      subject_id INTEGER NOT NULL,
      class_id INTEGER NOT NULL,
      FOREIGN KEY(teacher_id) REFERENCES teachers(id),
      FOREIGN KEY(subject_id) REFERENCES subjects(id),
      FOREIGN KEY(class_id) REFERENCES classes(id)
    );
  `);

  // Create schedules table
  db.exec(`
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id INTEGER NOT NULL,
      teacher_id INTEGER NOT NULL,
      subject_id INTEGER NOT NULL,
      day_of_week TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      schedule_image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(class_id) REFERENCES classes(id),
      FOREIGN KEY(teacher_id) REFERENCES teachers(id),
      FOREIGN KEY(subject_id) REFERENCES subjects(id)
    );
  `);

  // Create assignments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL,
      subject_id INTEGER NOT NULL,
      class_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      assignment_link TEXT NOT NULL,
      due_date DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(teacher_id) REFERENCES teachers(id),
      FOREIGN KEY(subject_id) REFERENCES subjects(id),
      FOREIGN KEY(class_id) REFERENCES classes(id)
    );
  `);

  // Create student_assignments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS student_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      assignment_id INTEGER NOT NULL,
      is_submitted INTEGER DEFAULT 0,
      submission_date DATETIME,
      grade REAL,
      FOREIGN KEY(student_id) REFERENCES students(id),
      FOREIGN KEY(assignment_id) REFERENCES assignments(id)
    );
  `);

  // Create exams table
  db.exec(`
    CREATE TABLE IF NOT EXISTS exams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL,
      subject_id INTEGER NOT NULL,
      class_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      exam_link TEXT NOT NULL,
      start_date DATETIME NOT NULL,
      end_date DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(teacher_id) REFERENCES teachers(id),
      FOREIGN KEY(subject_id) REFERENCES subjects(id),
      FOREIGN KEY(class_id) REFERENCES classes(id)
    );
  `);

  // Create student_exams table
  db.exec(`
    CREATE TABLE IF NOT EXISTS student_exams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      exam_id INTEGER NOT NULL,
      is_completed INTEGER DEFAULT 0,
      completion_date DATETIME,
      score REAL,
      FOREIGN KEY(student_id) REFERENCES students(id),
      FOREIGN KEY(exam_id) REFERENCES exams(id)
    );
  `);

  // Create attendance table
  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      class_id INTEGER NOT NULL,
      date DATETIME NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('present', 'absent', 'late')),
      notes TEXT,
      recorded_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(student_id) REFERENCES students(id),
      FOREIGN KEY(class_id) REFERENCES classes(id),
      FOREIGN KEY(recorded_by) REFERENCES teachers(id)
    );
  `);

  // Create messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      subject TEXT,
      content TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(sender_id) REFERENCES users(id),
      FOREIGN KEY(receiver_id) REFERENCES users(id)
    );
  `);

  // Create meetings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS meetings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_by INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      meeting_date DATETIME NOT NULL,
      meeting_link TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(created_by) REFERENCES users(id)
    );
  `);

  // Create meeting_attendees table
  db.exec(`
    CREATE TABLE IF NOT EXISTS meeting_attendees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meeting_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      is_attended INTEGER DEFAULT 0,
      FOREIGN KEY(meeting_id) REFERENCES meetings(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  console.log('✅ تم تهيئة قاعدة البيانات بنجاح');
}

export default db;
