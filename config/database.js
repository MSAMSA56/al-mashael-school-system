import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// إنشاء pool للاتصال بقاعدة البيانات
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'al_mashael_school',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// معالج الأخطاء
pool.on('error', (err) => {
  console.error('خطأ غير متوقع في pool:', err);
  process.exit(-1);
});

// دالة للاتصال بقاعدة البيانات
export async function connectDatabase() {
  try {
    const client = await pool.connect();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
    client.release();
  } catch (error) {
    console.error('❌ فشل الاتصال بقاعدة البيانات:', error.message);
    throw error;
  }
}

// دالة لتنفيذ استعلام
export async function query(text, params) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('❌ خطأ في الاستعلام:', error.message);
    throw error;
  }
}

// دالة للإغلاق الآمن
export async function closeDatabase() {
  try {
    await pool.end();
    console.log('✅ تم إغلاق الاتصال بقاعدة البيانات');
  } catch (error) {
    console.error('❌ خطأ في إغلاق الاتصال:', error.message);
    throw error;
  }
}

export default pool;
