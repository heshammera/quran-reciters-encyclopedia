import { createClient } from "@/lib/supabase/server";
import { getCurrentAdminUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import RecitersClient from "@/components/admin/RecitersClient";
import { Suspense } from "react";

async function RecitersData() {
    const supabase = await createClient();
    const user = await getCurrentAdminUser();

    // Permission Checks
    const canCreate = hasPermission(user, 'reciters', 'create');
    const canEdit = hasPermission(user, 'reciters', 'edit');
    const canDelete = hasPermission(user, 'reciters', 'delete');

    // Fetch all reciters with recordings count
    const { data: reciters, error } = await supabase
        .from("reciters")
        .select(`
            id,
            name_ar,
            recordings:recordings(count)
        `)
        .order("name_ar");

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                حدث خطأ أثناء جلب البيانات: {error.message}
            </div>
        );
    }

    // Transform data to include recordings count
    const recitersWithCount = reciters?.map(reciter => ({
        id: reciter.id,
        name_ar: reciter.name_ar,
        name_en: null,
        is_published: true, // Default to true since column doesn't exist
        recordings_count: (reciter.recordings as any)?.[0]?.count || 0
    })) || [];

    return (
        <RecitersClient
            reciters={recitersWithCount}
            canCreate={canCreate}
            canEdit={canEdit}
            canDelete={canDelete}
        />
    );
}

export default function RecitersPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">جاري التحميل...</div>}>
            <RecitersData />
        </Suspense>
    );
}
