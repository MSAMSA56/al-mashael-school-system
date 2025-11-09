import Database from 'better-sqlite3';
import bcryptjs from 'bcryptjs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'al_mashael_school.db');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

async function seed() {
  try {
    console.log('🌱 بدء ملء قاعدة البيانات...');

    // Create demo users
    const users = [
      {
        email: 'ahmed@almashaeel.edu.sa',
        password: bcryptjs.hashSync('password123', 10),
        firstName: 'أحمد',
        lastName: 'محمد',
        role: 'student',
        phone: '0501234567',
      },
      {
        email: 'khalid@almashaeel.edu.sa',
        password: bcryptjs.hashSync('password123', 10),
        firstName: 'خالد',
        lastName: 'علي',
        role: 'teacher',
        phone: '0502345678',
      },
      {
        email: 'admin@almashaeel.edu.sa',
        password: bcryptjs.hashSync('password123', 10),
        firstName: 'محمد',
        lastName: 'الإدارة',
        role: 'admin',
        phone: '0503456789',
      },
      {
        email: 'director@almashaeel.edu.sa',
        password: bcryptjs.hashSync('password123', 10),
        firstName: 'عبدالله',
        lastName: 'المدير',
        role: 'director',
        phone: '0504567890',
      },
    ];

    console.log('📝 إنشاء المستخدمين...');
    const userStmt = db.prepare(
      'INSERT INTO users (email, password, first_name, last_name, role, phone) VALUES (?, ?, ?, ?, ?, ?)'
    );
    
    const userResults = [];
    for (const user of users) {
      const result = userStmt.run(user.email, user.password, user.firstName, user.lastName, user.role, user.phone);
      userResults.push({ ...user, id: result.lastInsertRowid });
    }

    // Create student
    console.log('👨‍🎓 إنشاء الطلاب...');
    const studentUser = userResults.find(u => u.role === 'student');
    const studentStmt = db.prepare(
      'INSERT INTO students (user_id, student_id, grade, class) VALUES (?, ?, ?, ?)'
    );
    studentStmt.run(studentUser.id, 'STU001', 'first_secondary', 'أول ثانوي - أ');

    // Create teacher
    console.log('👨‍🏫 إنشاء المعلمين...');
    const teacherUser = userResults.find(u => u.role === 'teacher');
    const teacherStmt = db.prepare(
      'INSERT INTO teachers (user_id, teacher_id, specialization) VALUES (?, ?, ?)'
    );
    teacherStmt.run(teacherUser.id, 'TCH001', 'الرياضيات');

    // Create classes
    console.log('📚 إنشاء الفصول...');
    const classes = [
      { name: 'أول ثانوي - أ', grade: 'first_secondary', capacity: 30 },
      { name: 'أول ثانوي - ب', grade: 'first_secondary', capacity: 30 },
      { name: 'ثاني ثانوي - أ', grade: 'second_secondary', capacity: 30 },
      { name: 'ثالث ثانوي - أ', grade: 'third_secondary', capacity: 30 },
    ];

    const classStmt = db.prepare(
      'INSERT INTO classes (name, grade, capacity) VALUES (?, ?, ?)'
    );
    
    const classResults = [];
    for (const cls of classes) {
      const result = classStmt.run(cls.name, cls.grade, cls.capacity);
      classResults.push({ ...cls, id: result.lastInsertRowid });
    }

    // Create subjects
    console.log('📖 إنشاء المواد الدراسية...');
    const subjects = [
      { name: 'الرياضيات', code: 'MATH101', description: 'مادة الرياضيات' },
      { name: 'اللغة العربية', code: 'ARAB101', description: 'مادة اللغة العربية' },
      { name: 'العلوم', code: 'SCI101', description: 'مادة العلوم' },
      { name: 'اللغة الإنجليزية', code: 'ENG101', description: 'مادة اللغة الإنجليزية' },
      { name: 'الدراسات الاجتماعية', code: 'SOC101', description: 'مادة الدراسات الاجتماعية' },
    ];

    const subjectStmt = db.prepare(
      'INSERT INTO subjects (name, code, description) VALUES (?, ?, ?)'
    );
    
    const subjectResults = [];
    for (const subject of subjects) {
      const result = subjectStmt.run(subject.name, subject.code, subject.description);
      subjectResults.push({ ...subject, id: result.lastInsertRowid });
    }

    // Create teacher subjects
    console.log('🔗 ربط المعلمين بالمواد...');
    const mathSubject = subjectResults.find(s => s.code === 'MATH101');
    const firstClass = classResults[0];

    // Get the actual teacher ID from database
    const teacherRecord = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(teacherUser.id);
    
    const teacherSubjectStmt = db.prepare(
      'INSERT INTO teacher_subjects (teacher_id, subject_id, class_id) VALUES (?, ?, ?)'
    );
    teacherSubjectStmt.run(teacherRecord.id, mathSubject.id, firstClass.id);

    // Create schedules
    console.log('📅 إنشاء الجداول الزمنية...');
    const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء'];
    const scheduleStmt = db.prepare(
      'INSERT INTO schedules (class_id, teacher_id, subject_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)'
    );

    for (let i = 0; i < days.length; i++) {
      scheduleStmt.run(firstClass.id, teacherRecord.id, mathSubject.id, days[i], '08:00', '09:00');
    }

    // Create sample assignments
    console.log('📝 إنشاء واجبات تجريبية...');
    const assignmentStmt = db.prepare(
      'INSERT INTO assignments (teacher_id, subject_id, class_id, title, description, assignment_link, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    
    assignmentStmt.run(
      teacherRecord.id,
      mathSubject.id,
      firstClass.id,
      'حل المسائل الرياضية',
      'حل المسائل من 1 إلى 10 في الكتاب',
      'https://example.com/assignment1',
      dueDate.toISOString()
    );

    // Create sample exams
    console.log('✏️ إنشاء اختبارات تجريبية...');
    const examStmt = db.prepare(
      'INSERT INTO exams (teacher_id, subject_id, class_id, title, description, exam_link, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 14);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2);

    examStmt.run(
      teacherRecord.id,
      mathSubject.id,
      firstClass.id,
      'اختبار الفصل الأول',
      'اختبار شامل على الفصل الأول من المنهج',
      'https://example.com/exam1',
      startDate.toISOString(),
      endDate.toISOString()
    );

    console.log('\n✅ تم ملء قاعدة البيانات بنجاح!');
    console.log('\n📋 حسابات تجريبية:');
    console.log('┌────────────────────────────────────────────────────┐');
    console.log('│ الدور     │ البريد الإلكتروني         │ كلمة المرور │');
    console.log('├────────────────────────────────────────────────────┤');
    console.log('│ طالب     │ ahmed@almashaeel.edu.sa   │ password123 │');
    console.log('│ معلم     │ khalid@almashaeel.edu.sa  │ password123 │');
    console.log('│ إداري    │ admin@almashaeel.edu.sa   │ password123 │');
    console.log('│ مدير     │ director@almashaeel.edu.sa│ password123 │');
    console.log('└────────────────────────────────────────────────────┘');

    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ أثناء ملء قاعدة البيانات:', error);
    process.exit(1);
  }
}

seed();
