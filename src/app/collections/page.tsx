
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import CollectionList from "@/components/collections/CollectionList";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "المجموعات المختارة | موسوعة قرّاء القرآن",
    description: "مجموعات مختارة من التلاوات النادرة والمرتلة والمجودة، تم جمعها بعناية.",
};

export default async function CollectionsIndexPage() {
    const supabase = await createClient();

    // Fetch published collections
    const { data: collections } = await supabase
        .from("collections")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                    المجموعات المختارة
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    باقات صوتية مميزة تم إعدادها يدوياً لتناسب مختلف الأذواق والمناسبات
                </p>
            </div>

            <CollectionList collections={collections || []} />
        </div>
    );
}
