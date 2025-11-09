# البدء السريع - Quick Start Guide

## 🚀 ابدأ في 5 دقائق فقط!

### الخطوة 1: إعداد Firebase (10 دقائق)

اتبع هذا الدليل بالتفصيل:
👉 **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)**

### الخطوة 2: تحديث ملف .env

```bash
# افتح ملف .env وأضف:
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### الخطوة 3: تشغيل التطبيق

```bash
cd /home/ubuntu/al-mashael-school-system
npm install
npm run dev
```

### الخطوة 4: فتح الموقع

افتح المتصفح على:
```
http://localhost:5173
```

### الخطوة 5: تسجيل الدخول

استخدم أحد الحسابات التجريبية:

| الدور | البريد | كلمة المرور |
|------|-------|-----------|
| 👨‍🎓 طالب | ahmed@almashaeel.edu.sa | password123 |
| 👨‍🏫 معلم | khalid@almashaeel.edu.sa | password123 |
| 👨‍💼 إداري | admin@almashaeel.edu.sa | password123 |
| ⭐ مدير | director@almashaeel.edu.sa | password123 |

---

## 🌐 النشر على Firebase

عندما تكون جاهزاً للنشر:

👉 **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

---

## 📚 المزيد من المعلومات

- **[README.md](./README.md)** - دليل شامل
- **[FEATURES.md](./FEATURES.md)** - جميع الميزات
- **[INSTALLATION.md](./INSTALLATION.md)** - تفاصيل التثبيت

---

## ⚡ الأوامر المهمة

```bash
# تشغيل التطبيق
npm run dev

# بناء للإنتاج
npm run build

# نشر على Firebase
firebase deploy

# تسجيل الدخول إلى Firebase
firebase login
```

---

## 🆘 مشاكل شائعة

**المشكلة: "Cannot find module"**
```bash
npm install
```

**المشكلة: "Port 5173 already in use"**
```bash
npm run dev -- --port 5174
```

**المشكلة: "Firebase config not found"**
- تأكد من ملف `.env` يحتوي على جميع المتغيرات

---

**تم! الآن يمكنك البدء 🎉**
