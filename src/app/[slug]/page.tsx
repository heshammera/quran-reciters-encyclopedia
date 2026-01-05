
import { getStaticPageBySlug } from "@/app/actions/pages";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Force dynamic because content changes via admin
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
    // Await params for Next 15
    const { slug } = await Promise.resolve(params);
    const page = await getStaticPageBySlug(slug);
    if (!page || !page.is_published) return {};

    return {
        title: `${page.title_ar} | موسوعة القراء`,
    };
}

export default async function StaticPageComponent({ params }: { params: { slug: string } }) {
    // Await params for Next 15
    const { slug } = await Promise.resolve(params);
    const page = await getStaticPageBySlug(slug);

    if (!page || !page.is_published) {
        return notFound();
    }

    return (
        <main className="container mx-auto px-4 py-12">
            <article className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 sm:p-12">
                <header className="mb-8 border-b border-slate-100 dark:border-slate-700 pb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        {page.title_ar}
                    </h1>
                    <div className="text-sm text-slate-500">
                        آخر تحديث: {new Date(page.updated_at).toLocaleDateString("ar-EG")}
                    </div>
                </header>

                <div className="prose prose-lg dark:prose-invert max-w-none prose-emerald prose-headings:font-bold prose-a:text-emerald-600">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {page.content_markdown}
                    </ReactMarkdown>
                </div>
            </article>
        </main>
    );
}
