
import CollectionForm from "@/components/admin/CollectionForm";
import CollectionItemsManager from "@/components/admin/CollectionItemsManager";
import Link from "next/link";
import { getCollection, deleteCollection } from "@/app/actions/collections";
import { notFound, redirect } from "next/navigation";

interface EditCollectionPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditCollectionPage({ params }: EditCollectionPageProps) {
    const { id } = await params;

    let collection;
    try {
        collection = await getCollection(id);
    } catch {
        notFound();
    }

    if (!collection) notFound();

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/collections"
                        className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-colors"
                    >
                        <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            تعديل المجموعة
                        </h1>
                        <p className="text-slate-500">{collection.title_ar}</p>
                    </div>
                </div>

                <form action={async () => {
                    "use server";
                    await deleteCollection(id);
                    redirect("/admin/collections");
                }}>
                    <button type="submit" className="text-red-500 hover:text-red-700 text-sm font-bold border border-red-200 px-3 py-1 rounded bg-red-50">
                        حذف المجموعة
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <CollectionForm initialData={collection} isEdit />
                </div>

                <div className="lg:col-span-2">
                    <CollectionItemsManager collectionId={collection.id} items={collection.collection_items || []} />
                </div>
            </div>
        </div>
    );
}
