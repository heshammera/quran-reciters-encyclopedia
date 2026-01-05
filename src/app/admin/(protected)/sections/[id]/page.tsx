import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import SectionForm from "@/components/admin/SectionForm";
import { notFound } from "next/navigation";

interface EditSectionPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditSectionPage({ params }: EditSectionPageProps) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: section } = await supabase
        .from("sections")
        .select("*")
        .eq("id", id)
        .single();

    if (!section) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/admin/sections"
                    className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-colors"
                >
                    <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        تعديل القسم
                    </h1>
                    <p className="text-slate-500 mt-1">{section.name_ar}</p>
                </div>
            </div>

            <SectionForm initialData={section} />
        </div>
    );
}
