import { extractToken, verifyToken } from '../config/auth.js';

// Middleware للتحقق من التوكن
export function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = extractToken(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'لم يتم توفير توكن المصادقة',
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message,
    });
  }
}

// Middleware للتحقق من دور المستخدم
export function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'لم يتم المصادقة',
      });
    }

    if (!allowedRoles.includes(req.user.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحيات كافية للوصول إلى هذا المورد',
      });
    }

    next();
  };
}

// Middleware لمعالجة الأخطاء
export function errorHandler(err, req, res, next) {
  console.error('❌ خطأ:', err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'حدث خطأ في الخادم';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err.stack }),
  });
}
