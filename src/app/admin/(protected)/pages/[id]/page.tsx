
import { getStaticPages } from "@/app/actions/pages";
import PageEditor from "@/components/admin/PageEditor";
import { notFound } from "next/navigation";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const pages = await getStaticPages();
    const page = pages.find(p => p.id === id);

    // Note: Ideally use getStaticPageById but fetching all is cheap for 5 pages.

    if (!page) {
        return notFound();
    }

    return <PageEditor page={page} />;
}
