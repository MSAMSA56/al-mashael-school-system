import { query, closeDatabase } from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function initializeDatabase() {
  try {
    console.log('🔄 جاري إنشاء جداول قاعدة البيانات...\n');

    // جدول المستخدمين
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'student',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      );
    `);
    console.log('✅ تم إنشاء جدول المستخدمين');

    // جدول الفصول الدراسية
    await query(`
      CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        grade VARCHAR(50) NOT NULL,
        description TEXT,
        teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_grade (grade)
      );
    `);
    console.log('✅ تم إنشاء جدول الفصول الدراسية');

    // جدول المواد الدراسية
    await query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ تم إنشاء جدول المواد الدراسية');

    // جدول الدرجات
    await query(`
      CREATE TABLE IF NOT EXISTS grades (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
        class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        score DECIMAL(5, 2),
        term VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_student (student_id),
        INDEX idx_subject (subject_id),
        INDEX idx_class (class_id)
      );
    `);
    console.log('✅ تم إنشاء جدول الدرجات');

    // جدول الحضور والغياب
    await query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        attendance_date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'present',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_student (student_id),
        INDEX idx_date (attendance_date)
      );
    `);
    console.log('✅ تم إنشاء جدول الحضور والغياب');

    // جدول الإعلانات
    await query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_author (author_id)
      );
    `);
    console.log('✅ تم إنشاء جدول الإعلانات');

    // إدراج بيانات تجريبية
    console.log('\n🔄 جاري إدراج البيانات التجريبية...\n');

    // إدراج مستخدمين تجريبيين
    await query(`
      INSERT INTO users (email, password, name, role) VALUES
      ('ahmed@almashaeel.edu.sa', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/D1K', 'أحمد محمد العلي', 'student'),
      ('khalid@almashaeel.edu.sa', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/D1K', 'خالد أحمد السالم', 'teacher'),
      ('admin@almashaeel.edu.sa', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/D1K', 'عبدالله محمد الإدريسي', 'admin')
      ON CONFLICT (email) DO NOTHING;
    `);
    console.log('✅ تم إدراج المستخدمين التجريبيين');

    // إدراج مواد دراسية
    await query(`
      INSERT INTO subjects (name, code, description) VALUES
      ('الرياضيات', 'MATH101', 'مادة الرياضيات الأساسية'),
      ('اللغة العربية', 'AR101', 'مادة اللغة العربية'),
      ('اللغة الإنجليزية', 'EN101', 'مادة اللغة الإنجليزية'),
      ('العلوم', 'SCI101', 'مادة العلوم الطبيعية'),
      ('الدراسات الاجتماعية', 'SOC101', 'مادة الدراسات الاجتماعية')
      ON CONFLICT (code) DO NOTHING;
    `);
    console.log('✅ تم إدراج المواد الدراسية');

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║   ✅ تم إنشاء قاعدة البيانات بنجاح                   ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log('📝 حسابات تجريبية:');
    console.log('   البريد الإلكتروني: ahmed@almashaeel.edu.sa (طالب)');
    console.log('   البريد الإلكتروني: khalid@almashaeel.edu.sa (معلم)');
    console.log('   البريد الإلكتروني: admin@almashaeel.edu.sa (مسؤول)');
    console.log('   كلمة المرور: password123\n');

  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  قاعدة البيانات موجودة بالفعل');
    } else {
      console.error('❌ خطأ في إنشاء قاعدة البيانات:', error.message);
    }
  } finally {
    await closeDatabase();
  }
}

// تشغيل البرنامج
initializeDatabase();
