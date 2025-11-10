import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

// دالة لتشفير كلمة المرور
export async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error('خطأ في تشفير كلمة المرور: ' + error.message);
  }
}

// دالة للتحقق من كلمة المرور
export async function verifyPassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error('خطأ في التحقق من كلمة المرور: ' + error.message);
  }
}

// دالة لإنشاء JWT Token
export function generateToken(userId, userRole) {
  try {
    const payload = {
      userId,
      userRole,
      iat: Math.floor(Date.now() / 1000),
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  } catch (error) {
    throw new Error('خطأ في إنشاء التوكن: ' + error.message);
  }
}

// دالة للتحقق من JWT Token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('توكن غير صحيح أو منتهي الصلاحية: ' + error.message);
  }
}

// دالة لاستخراج التوكن من headers
export function extractToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
