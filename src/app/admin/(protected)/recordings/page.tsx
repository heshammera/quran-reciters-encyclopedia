import { createClient } from "@/lib/supabase/server";
import { getCurrentAdminUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import RecordingsClient from "@/components/admin/RecordingsClient";
import { Suspense } from "react";

async function RecordingsData() {
    const supabase = await createClient();
    const user = await getCurrentAdminUser();

    // Permission Checks
    const canCreate = hasPermission(user, 'recordings', 'create');
    const canEdit = hasPermission(user, 'recordings', 'edit');
    const canDelete = hasPermission(user, 'recordings', 'delete');

    // Fetch ALL recordings (filtering will happen client-side)
    const { data: recordings, error: recordingsError } = await supabase
        .from("recordings")
        .select(`
            *,
            reciters (id, name_ar),
            sections (name_ar),
            recording_coverage(*)
        `)
        .eq('type', 'audio')
        .order("created_at", { ascending: false });

    // Fetch list of all reciters for filter dropdown
    const { data: reciters } = await supabase
        .from("reciters")
        .select("id, name_ar")
        .order("name_ar");

    if (recordingsError) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                حدث خطأ أثناء جلب البيانات: {recordingsError.message}
            </div>
        );
    }

    return (
        <RecordingsClient
            recordings={recordings || []}
            reciters={reciters || []}
            canCreate={canCreate}
            canEdit={canEdit}
            canDelete={canDelete}
        />
    );
}

export default function RecordingsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">جاري التحميل...</div>}>
            <RecordingsData />
        </Suspense>
    );
}
