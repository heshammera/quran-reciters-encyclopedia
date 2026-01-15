-- إضافة الحقول الجديدة إلى جدول recordings
-- Migration: 014_add_recording_metadata_fields

-- إضافة الأعمدة الجديدة
ALTER TABLE recordings 
ADD COLUMN IF NOT EXISTS venue TEXT,
ADD COLUMN IF NOT EXISTS publisher TEXT,
ADD COLUMN IF NOT EXISTS recording_details TEXT;

-- إضافة تعليقات توضيحية للأعمدة
COMMENT ON COLUMN recordings.venue IS 'المكان التفصيلي للتلاوة (مثل: مسجد الحسين)';
COMMENT ON COLUMN recordings.publisher IS 'الناشر أو الجهة المهدية للتسجيل (مثل: إهداء من جمعية المحافظة على القرآن)';
COMMENT ON COLUMN recordings.recording_details IS 'تفاصيل إضافية عن التلاوة، جودة الصوت، الظروف، إلخ';

-- ملاحظة: حقل recording_date هو JSONB ولا يحتاج تعديل في الجدول
-- لأنه يدعم أي هيكل JSON بشكل مرن
-- سيتم تحديث البيانات فيه ليشمل: {year, month, day, time_period}
