import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateToken } from '../config/auth.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// تسجيل الدخول
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('البريد الإلكتروني غير صحيح'),
    body('password').notEmpty().withMessage('كلمة المرور مطلوبة'),
  ],
  async (req, res) => {
    try {
      // التحقق من الأخطاء
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'بيانات غير صحيحة',
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // التحقق من بيانات الدخول
      const user = await User.verifyLogin(email, password);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        });
      }

      // إنشاء التوكن
      const token = generateToken(user.id, user.role);

      res.json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في تسجيل الدخول: ' + error.message,
      });
    }
  }
);

// تسجيل مستخدم جديد
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('البريد الإلكتروني غير صحيح'),
    body('password').isLength({ min: 6 }).withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
    body('name').notEmpty().withMessage('الاسم مطلوب'),
  ],
  async (req, res) => {
    try {
      // التحقق من الأخطاء
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'بيانات غير صحيحة',
          errors: errors.array(),
        });
      }

      const { email, password, name, role = 'student' } = req.body;

      // التحقق من وجود المستخدم
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'هذا البريد الإلكتروني مسجل بالفعل',
        });
      }

      // إنشاء المستخدم
      const newUser = await User.create(email, password, name, role);

      // إنشاء التوكن
      const token = generateToken(newUser.id, newUser.role);

      res.status(201).json({
        success: true,
        message: 'تم إنشاء الحساب بنجاح',
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في إنشاء الحساب: ' + error.message,
      });
    }
  }
);

// الحصول على بيانات المستخدم الحالي
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود',
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات المستخدم: ' + error.message,
    });
  }
});

// تسجيل الخروج (يمكن أن يكون على جانب العميل بحذف التوكن)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'تم تسجيل الخروج بنجاح',
  });
});

export default router;
