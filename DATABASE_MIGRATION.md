# تطبيق Database Migration على Supabase

## الخطوة 1: الدخول إلى SQL Editor

1. افتح لوحة تحكمSupabase: [app.supabase.com](https://app.supabase.com)
2. اختر مشروعك: `quran-reciters-encyclopedia`
3. من القائمة الجانبية، اذهب إلى **SQL Editor**

---

## الخطوة 2: تنفيذ Migration

1. اضغط **New Query**
2. افتح ملف: `supabase/migrations/001_initial_schema.sql`
3. انسخ **كل** محتوى الملف
4. الصقه في SQL Editor
5. اضغط **Run** (أو Ctrl+Enter)

⏳ يجب أن ينتهي في أقل من 5 ثوانٍ

---

## الخطوة 3: التحقق من النجاح

✅ يجب أن ترى رسالة: **Success. No rows returned**

### للتأكد، شغّل هذا الاستعلام:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**يجب أن ترى 11 جدول:**
- change_log
- file_deduplication
- media_files
- quran_index
- reciter_phases
- reciters
- recording_coverage
- recordings
- reference_tracks
- sections
- validation_warnings

---

## الخطوة 4: التحقق من الأقسام الافتراضية

```sql
SELECT name_ar, slug FROM sections ORDER BY display_order;
```

**يجب أن ترى 6 أقسام:**
- مرتل (murattal)
- مجود (mujawwad)
- حفلات ومناسبات (events)
- ابتهالات (supplications)
- أذان (adhan)
- دعاء (duaa)

---

## الخطوة 5: اختبار الاتصال من المشروع

ارجع للمشروع وشغّل:

```bash
npm run dev
```

افتح Developer Console في المتصفح (F12) وتحقق من عدم وجود أخطاء Supabase.

---

## حل المشاكل

### خطأ: "relation already exists"
- معناها الجداول موجودة بالفعل
- يمكنك تخطي هذا الخطأ أو
- احذف الجداول وأعد التشغيل

### خطأ: "permission denied"
- تأكد من أنك مسجل دخول كـ Owner
- أو استخدم Database Password من Settings

---

**✅ بعد النجاح:** أخبرني لأبدأ في seeding فهرس القرآن (6236 آية)
