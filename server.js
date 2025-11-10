import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database.js';
import { errorHandler } from './middleware/authMiddleware.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';

// تحميل متغيرات البيئة
dotenv.config();

// إنشاء تطبيق Express
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// ===== Middleware =====
// أمان الخادم
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.APP_URL 
    : '*',
  credentials: true,
}));

// معالجة JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ===== Static Files =====
app.use(express.static('public'));

// ===== API Routes =====
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

// ===== Health Check =====
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'الخادم يعمل بشكل صحيح',
    timestamp: new Date().toISOString(),
  });
});

// ===== 404 Handler =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'المورد غير موجود',
  });
});

// ===== Error Handler =====
app.use(errorHandler);

// ===== Start Server =====
async function startServer() {
  try {
    // الاتصال بقاعدة البيانات
    await connectDatabase();

    // بدء الخادم
    app.listen(PORT, HOST, () => {
      console.log(`
╔════════════════════════════════════════════════════════╗
║   نظام إدارة مدرسة المشاعل الأهلية                     ║
║   Al-Mashael School Management System                  ║
╚════════════════════════════════════════════════════════╝

✅ الخادم يعمل بنجاح
📍 الرابط: http://${HOST}:${PORT}
🔧 البيئة: ${process.env.NODE_ENV || 'development'}
📊 قاعدة البيانات: ${process.env.DB_NAME}

API Endpoints:
  POST   /api/auth/login       - تسجيل الدخول
  POST   /api/auth/register    - إنشاء حساب جديد
  GET    /api/auth/me          - بيانات المستخدم الحالي
  POST   /api/auth/logout      - تسجيل الخروج
  GET    /api/users            - جميع المستخدمين (مسؤول فقط)
  GET    /api/users/:id        - بيانات مستخدم معين
  PUT    /api/users/:id        - تحديث بيانات المستخدم
  DELETE /api/users/:id        - حذف مستخدم (مسؤول فقط)
  GET    /api/health           - فحص صحة الخادم

📚 الوثائق: http://${HOST}:${PORT}/docs
      `);
    });
  } catch (error) {
    console.error('❌ فشل بدء الخادم:', error.message);
    process.exit(1);
  }
}

// بدء الخادم
startServer();

// معالجة الأخطاء غير المتوقعة
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ خطأ غير معالج:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ استثناء غير متوقع:', error);
  process.exit(1);
});

export default app;
