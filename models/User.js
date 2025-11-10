import { query } from '../config/database.js';
import { hashPassword, verifyPassword } from '../config/auth.js';

export class User {
  // البحث عن مستخدم بالبريد الإلكتروني
  static async findByEmail(email) {
    try {
      const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error('خطأ في البحث عن المستخدم: ' + error.message);
    }
  }

  // البحث عن مستخدم بالـ ID
  static async findById(id) {
    try {
      const result = await query(
        'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error('خطأ في البحث عن المستخدم: ' + error.message);
    }
  }

  // إنشاء مستخدم جديد
  static async create(email, password, name, role = 'student') {
    try {
      const hashedPassword = await hashPassword(password);
      const result = await query(
        `INSERT INTO users (email, password, name, role, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING id, email, name, role, created_at`,
        [email, hashedPassword, name, role]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error('خطأ في إنشاء المستخدم: ' + error.message);
    }
  }

  // التحقق من بيانات تسجيل الدخول
  static async verifyLogin(email, password) {
    try {
      const user = await this.findByEmail(email);
      if (!user) {
        return null;
      }

      const isPasswordValid = await verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    } catch (error) {
      throw new Error('خطأ في التحقق من بيانات الدخول: ' + error.message);
    }
  }

  // الحصول على جميع المستخدمين
  static async getAll(limit = 50, offset = 0) {
    try {
      const result = await query(
        `SELECT id, email, name, role, created_at FROM users
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      return result.rows;
    } catch (error) {
      throw new Error('خطأ في جلب المستخدمين: ' + error.message);
    }
  }

  // تحديث بيانات المستخدم
  static async update(id, data) {
    try {
      const { name, email } = data;
      const result = await query(
        `UPDATE users SET name = $1, email = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING id, email, name, role, created_at`,
        [name, email, id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error('خطأ في تحديث المستخدم: ' + error.message);
    }
  }

  // حذف مستخدم
  static async delete(id) {
    try {
      const result = await query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error('خطأ في حذف المستخدم: ' + error.message);
    }
  }
}

export default User;
