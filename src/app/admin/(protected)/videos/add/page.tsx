import { getReciters, getSections, getReciterCities } from "@/lib/supabase/queries";
import VideoForm from "@/components/admin/VideoForm";

export default async function AddVideoPage() {
    const [reciters, sections] = await Promise.all([
        getReciters(),
        getSections(),
    ]);

    // We pass an empty list for cities initially or fetch from a "most popular" list if needed, 
    // but VideoForm handles cities via text input + datalist. 
    // Just passing empty/mock for now as `getReciterCities` requires an ID not available globally easily without a huge query.
    // Actually `getReciterCities` takes reciterId. We can't pre-fetch cities for *all* reciters easily.
    // Let's pass an empty list or common cities.
    const commonCities = [
        { name: "القاهرة", count: 0 },
        { name: "الإسكندرية", count: 0 },
        { name: "المسجد الأقصى", count: 0 },
        { name: "الحرم المكي", count: 0 },
        { name: "الحرم النبوي", count: 0 },
        { name: "دمشق", count: 0 },
        { name: "بغداد", count: 0 },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    إضافة فيديو جديد
                </h1>
                <p className="text-slate-500 mt-1">
                    أضف رابط فيديو من يوتيوب وسيتم جلب البيانات تلقائياً
                </p>
            </div>

            <VideoForm
                reciters={reciters}
                sections={sections}
                cities={commonCities}
            />
        </div>
    );
}
