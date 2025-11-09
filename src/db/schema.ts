import { pgTable, serial, text, varchar, integer, timestamp, boolean, decimal, enum as pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', ['student', 'teacher', 'admin', 'director']);
export const gradeEnum = pgEnum('grade', ['first_secondary', 'second_secondary', 'third_secondary', 'first_intermediate', 'second_intermediate', 'third_intermediate']);
export const attendanceStatusEnum = pgEnum('attendance_status', ['present', 'absent', 'late']);

// Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  role: roleEnum('role').notNull(),
  phone: varchar('phone', { length: 20 }),
  profileImage: text('profile_image'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Students Table
export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  studentId: varchar('student_id', { length: 50 }).unique().notNull(),
  grade: gradeEnum('grade').notNull(),
  class: varchar('class', { length: 50 }).notNull(),
  enrollmentDate: timestamp('enrollment_date').defaultNow(),
});

// Teachers Table
export const teachers = pgTable('teachers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  teacherId: varchar('teacher_id', { length: 50 }).unique().notNull(),
  specialization: varchar('specialization', { length: 100 }).notNull(),
  joinDate: timestamp('join_date').defaultNow(),
});

// Subjects Table
export const subjects = pgTable('subjects', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 20 }).unique().notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Classes Table
export const classes = pgTable('classes', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  grade: gradeEnum('grade').notNull(),
  capacity: integer('capacity'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Teacher Subjects (Many-to-Many)
export const teacherSubjects = pgTable('teacher_subjects', {
  id: serial('id').primaryKey(),
  teacherId: integer('teacher_id').references(() => teachers.id).notNull(),
  subjectId: integer('subject_id').references(() => subjects.id).notNull(),
  classId: integer('class_id').references(() => classes.id).notNull(),
});

// Schedule Table
export const schedules = pgTable('schedules', {
  id: serial('id').primaryKey(),
  classId: integer('class_id').references(() => classes.id).notNull(),
  teacherId: integer('teacher_id').references(() => teachers.id).notNull(),
  subjectId: integer('subject_id').references(() => subjects.id).notNull(),
  dayOfWeek: varchar('day_of_week', { length: 20 }).notNull(),
  startTime: varchar('start_time', { length: 10 }).notNull(),
  endTime: varchar('end_time', { length: 10 }).notNull(),
  scheduleImage: text('schedule_image'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Assignments Table
export const assignments = pgTable('assignments', {
  id: serial('id').primaryKey(),
  teacherId: integer('teacher_id').references(() => teachers.id).notNull(),
  subjectId: integer('subject_id').references(() => subjects.id).notNull(),
  classId: integer('class_id').references(() => classes.id).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  assignmentLink: text('assignment_link').notNull(),
  dueDate: timestamp('due_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Student Assignments (Tracking)
export const studentAssignments = pgTable('student_assignments', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id).notNull(),
  assignmentId: integer('assignment_id').references(() => assignments.id).notNull(),
  isSubmitted: boolean('is_submitted').default(false),
  submissionDate: timestamp('submission_date'),
  grade: decimal('grade', { precision: 5, scale: 2 }),
});

// Exams Table
export const exams = pgTable('exams', {
  id: serial('id').primaryKey(),
  teacherId: integer('teacher_id').references(() => teachers.id).notNull(),
  subjectId: integer('subject_id').references(() => subjects.id).notNull(),
  classId: integer('class_id').references(() => classes.id).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  examLink: text('exam_link').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Student Exams (Tracking)
export const studentExams = pgTable('student_exams', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id).notNull(),
  examId: integer('exam_id').references(() => exams.id).notNull(),
  isCompleted: boolean('is_completed').default(false),
  completionDate: timestamp('completion_date'),
  score: decimal('score', { precision: 5, scale: 2 }),
});

// Attendance Table
export const attendance = pgTable('attendance', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id).notNull(),
  classId: integer('class_id').references(() => classes.id).notNull(),
  date: timestamp('date').notNull(),
  status: attendanceStatusEnum('status').notNull(),
  notes: text('notes'),
  recordedBy: integer('recorded_by').references(() => teachers.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Messages Table
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  senderId: integer('sender_id').references(() => users.id).notNull(),
  receiverId: integer('receiver_id').references(() => users.id).notNull(),
  subject: varchar('subject', { length: 200 }),
  content: text('content').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Meetings Table
export const meetings = pgTable('meetings', {
  id: serial('id').primaryKey(),
  createdBy: integer('created_by').references(() => users.id).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  meetingDate: timestamp('meeting_date').notNull(),
  meetingLink: text('meeting_link'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Meeting Attendees
export const meetingAttendees = pgTable('meeting_attendees', {
  id: serial('id').primaryKey(),
  meetingId: integer('meeting_id').references(() => meetings.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  isAttended: boolean('is_attended').default(false),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  student: one(students, { fields: [users.id], references: [students.userId] }),
  teacher: one(teachers, { fields: [users.id], references: [teachers.userId] }),
  sentMessages: many(messages, { relationName: 'sender' }),
  receivedMessages: many(messages, { relationName: 'receiver' }),
  createdMeetings: many(meetings),
  meetingAttendances: many(meetingAttendees),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, { fields: [students.userId], references: [users.id] }),
  assignments: many(studentAssignments),
  exams: many(studentExams),
  attendance: many(attendance),
}));

export const teachersRelations = relations(teachers, ({ one, many }) => ({
  user: one(users, { fields: [teachers.userId], references: [users.id] }),
  subjects: many(teacherSubjects),
  assignments: many(assignments),
  exams: many(exams),
  schedules: many(schedules),
  recordedAttendance: many(attendance),
}));

export const subjectsRelations = relations(subjects, ({ many }) => ({
  teachers: many(teacherSubjects),
  assignments: many(assignments),
  exams: many(exams),
  schedules: many(schedules),
}));

export const classesRelations = relations(classes, ({ many }) => ({
  teacherSubjects: many(teacherSubjects),
  schedules: many(schedules),
  assignments: many(assignments),
  exams: many(exams),
  attendance: many(attendance),
}));

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  teacher: one(teachers, { fields: [assignments.teacherId], references: [teachers.id] }),
  subject: one(subjects, { fields: [assignments.subjectId], references: [subjects.id] }),
  class: one(classes, { fields: [assignments.classId], references: [classes.id] }),
  studentAssignments: many(studentAssignments),
}));

export const examsRelations = relations(exams, ({ one, many }) => ({
  teacher: one(teachers, { fields: [exams.teacherId], references: [teachers.id] }),
  subject: one(subjects, { fields: [exams.subjectId], references: [subjects.id] }),
  class: one(classes, { fields: [exams.classId], references: [classes.id] }),
  studentExams: many(studentExams),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, { fields: [messages.senderId], references: [users.id], relationName: 'sender' }),
  receiver: one(users, { fields: [messages.receiverId], references: [users.id], relationName: 'receiver' }),
}));

export const meetingsRelations = relations(meetings, ({ one, many }) => ({
  creator: one(users, { fields: [meetings.createdBy], references: [users.id] }),
  attendees: many(meetingAttendees),
}));
