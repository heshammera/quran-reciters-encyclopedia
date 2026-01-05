import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ReciterForm from "@/components/admin/ReciterForm";
import PhasesManager from "@/components/admin/PhasesManager";
import ReciterRecordingsList from "@/components/admin/ReciterRecordingsList";
import { notFound } from "next/navigation";

interface EditReciterPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditReciterPage({ params }: EditReciterPageProps) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: reciter } = await supabase
        .from("reciters")
        .select("*")
        .eq("id", id)
        .single();

    if (!reciter) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/admin/reciters"
                    className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-colors"
                >
                    <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        تعديل بيانات القارئ
                    </h1>
                    <p className="text-slate-500 mt-1">{reciter.name_ar}</p>
                </div>
            </div>

            <ReciterForm initialData={reciter} />

            <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
                <PhasesManager reciterId={reciter.id} />
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
                <ReciterRecordingsList reciterId={reciter.id} />
            </div>
        </div>
    );
}
