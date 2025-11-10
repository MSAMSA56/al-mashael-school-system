import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// الحصول على جميع المستخدمين (للمسؤولين فقط)
router.get('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const users = await User.getAll(limit, offset);

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المستخدمين: ' + error.message,
    });
  }
});

// الحصول على بيانات مستخدم معين
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود',
      });
    }

    // التحقق من الصلاحيات (يمكن للمستخدم رؤية بياناته فقط أو المسؤول رؤية الجميع)
    if (req.user.userId !== parseInt(req.params.id) && req.user.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحيات كافية',
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

// تحديث بيانات المستخدم
router.put(
  '/:id',
  authenticateToken,
  [
    body('name').optional().notEmpty().withMessage('الاسم لا يمكن أن يكون فارغاً'),
    body('email').optional().isEmail().withMessage('البريد الإلكتروني غير صحيح'),
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

      // التحقق من الصلاحيات
      if (req.user.userId !== parseInt(req.params.id) && req.user.userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحيات كافية',
        });
      }

      const updatedUser = await User.update(req.params.id, req.body);
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'المستخدم غير موجود',
        });
      }

      res.json({
        success: true,
        message: 'تم تحديث بيانات المستخدم بنجاح',
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في تحديث بيانات المستخدم: ' + error.message,
      });
    }
  }
);

// حذف مستخدم (للمسؤولين فقط)
router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const deletedUser = await User.delete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود',
      });
    }

    res.json({
      success: true,
      message: 'تم حذف المستخدم بنجاح',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف المستخدم: ' + error.message,
    });
  }
});

export default router;
