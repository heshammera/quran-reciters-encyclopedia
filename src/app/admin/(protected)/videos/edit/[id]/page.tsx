import { getRecording, getReciters, getSections } from "@/lib/supabase/queries";
import VideoForm from "@/components/admin/VideoForm";
import { notFound } from "next/navigation";

interface EditVideoPageProps {
    params: {
        id: string;
    };
}

export default async function EditVideoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const [recording, reciters, sections] = await Promise.all([
        getRecording(id),
        getReciters(),
        getSections(),
    ]);

    if (!recording) {
        notFound();
    }

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
                    تعديل الفيديو
                </h1>
                <p className="text-slate-500 mt-1">
                    تعديل بيانات الفيديو المرئي
                </p>
            </div>

            <VideoForm
                initialData={recording}
                reciters={reciters}
                sections={sections}
                cities={commonCities}
            />
        </div>
    );
}
