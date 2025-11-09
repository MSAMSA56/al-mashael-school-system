# دليل التثبيت والتشغيل

## المتطلبات الأساسية

- **Node.js**: الإصدار 16 أو أحدث
- **npm**: يأتي مع Node.js
- **متصفح ويب**: Chrome أو Firefox أو Safari أو Edge

## خطوات التثبيت

### 1. استنساخ المستودع

```bash
git clone https://github.com/yourusername/al-mashael-school-system.git
cd al-mashael-school-system
```

### 2. تثبيت المكتبات

```bash
npm install
```

### 3. إنشاء قاعدة البيانات

```bash
# إنشاء الجداول
node init-db.mjs

# ملء البيانات التجريبية
node seed-db.mjs
```

### 4. تشغيل التطبيق

#### الخيار الأول: تشغيل الخادم والعميل معاً

```bash
npm run dev
```

سيتم تشغيل:
- الخادم على `http://localhost:3000`
- الواجهة الأمامية على `http://localhost:5173`

#### الخيار الثاني: تشغيل كل منهما على حدة

في نافذة terminal:
```bash
npm run server:dev
```

في نافذة terminal أخرى:
```bash
npm run client:dev
```

## حسابات الاختبار

بعد تشغيل التطبيق، يمكنك استخدام الحسابات التالية:

| الدور | البريد الإلكتروني | كلمة المرور |
|------|-----------------|-----------|
| طالب | ahmed@almashaeel.edu.sa | password123 |
| معلم | khalid@almashaeel.edu.sa | password123 |
| إداري | admin@almashaeel.edu.sa | password123 |
| مدير | director@almashaeel.edu.sa | password123 |

## الأوامر المتاحة

```bash
# تشغيل التطبيق في وضع التطوير
npm run dev

# تشغيل الخادم فقط
npm run server:dev

# تشغيل الواجهة الأمامية فقط
npm run client:dev

# بناء التطبيق للإنتاج
npm run build

# معاينة الإصدار الإنتاجي
npm run preview

# إعادة إنشاء قاعدة البيانات
node init-db.mjs && node seed-db.mjs
```

## استكشاف الأخطاء

### المشكلة: الخادم لا يستجيب

**الحل**: تأكد من أن المنفذ 3000 غير مستخدم أو غير المنفذ في ملف `.env`

### المشكلة: خطأ في قاعدة البيانات

**الحل**: احذف ملف `al_mashael_school.db` وأعد تشغيل:
```bash
rm al_mashael_school.db
node init-db.mjs
node seed-db.mjs
```

### المشكلة: خطأ في تثبيت المكتبات

**الحل**: حاول حذف `node_modules` و `package-lock.json` وإعادة التثبيت:
```bash
rm -rf node_modules package-lock.json
npm install
```

## البناء للإنتاج

```bash
# بناء الواجهة الأمامية
npm run build

# ستجد الملفات المبنية في مجلد `dist/`
```

## الملاحظات المهمة

1. **قاعدة البيانات**: يتم تخزين البيانات محلياً في ملف `al_mashael_school.db` باستخدام SQLite
2. **الأمان**: تأكد من تغيير `JWT_SECRET` في الإنتاج
3. **الحسابات التجريبية**: غيرها قبل النشر في الإنتاج
4. **الملفات الثابتة**: ضع الملفات الثابتة في مجلد `public/`

## الدعم والمساعدة

إذا واجهت أي مشاكل:

1. تحقق من رسائل الخطأ في console
2. تأكد من تثبيت Node.js بشكل صحيح
3. جرب حذف `node_modules` وإعادة التثبيت
4. افتح issue على GitHub

---

تم تطوير هذا النظام بواسطة فريق متخصص. للمزيد من المعلومات، راجع ملف README.md
