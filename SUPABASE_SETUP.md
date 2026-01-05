# دليل إعداد Supabase (الخطة المجانية)

## الخطوة 1: إنشاء حساب مجاني

1. اذهب إلى [supabase.com](https://supabase.com)
2. اضغط على **Start your project**
3. سجل حساب جديد باستخدام GitHub أو Google

---

## الخطوة 2: إنشاء مشروع جديد

1. اضغط على **New Project**
2. املأ المعلومات:
   - **Name**: `quran-reciters-encyclopedia`
   - **Database Password**: (احفظها!)
   - **Region**: اختر أقرب منطقة
   - **Pricing Plan**: Free
3. انتظر 1-2 دقيقة

---

## الخطوة 3: الحصول على بيانات الاعتماد

من **Settings > API**:

1. **Project URL**: `https://xyz.supabase.co`
2. **anon key**: يبدأ بـ `eyJhbGc...`
3. **service_role key**: ⚠️ سري، لا تشاركه

---

## الخطوة 4: تكوين `.env.local`

أنشئ ملف `.env.local` في جذر المشروع:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
```

---

## الخطوة 5: التحقق

```bash
npm run dev
```

إذا لم تظهر أخطاء ✅ الإعداد تم بنجاح!

---

**حدود المجاني**: 500MB DB, 1GB Storage, 2GB Bandwidth - كافية للمشروع
