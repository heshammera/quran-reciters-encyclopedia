import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentAdminUser } from "@/lib/auth";

export default async function DebugPermissionsPage() {
    const currentUser = await getCurrentAdminUser();
    const supabase = createAdminClient();

    // Fetch all user_roles
    const { data: allRoles, error } = await supabase
        .from("user_roles")
        .select("*");

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                🔍 تشخيص الصلاحيات
            </h1>

            {/* Current User Info */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">المستخدم الحالي</h2>
                <pre className="bg-slate-50 dark:bg-slate-900 p-4 rounded text-xs overflow-auto" dir="ltr">
                    {JSON.stringify(currentUser, null, 2)}
                </pre>
            </div>

            {/* All User Roles in DB */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">جميع الأدوار في قاعدة البيانات</h2>
                {error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded">
                        خطأ: {error.message}
                    </div>
                ) : (
                    <pre className="bg-slate-50 dark:bg-slate-900 p-4 rounded text-xs overflow-auto" dir="ltr">
                        {JSON.stringify(allRoles, null, 2)}
                    </pre>
                )}
            </div>

            {/* Migration Check */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-6 rounded-lg">
                <h2 className="text-lg font-bold mb-2 text-amber-900 dark:text-amber-200">⚠️ تحقق من التهيئة</h2>
                <p className="text-sm text-amber-800 dark:text-amber-300 mb-4">
                    إذا كان عمود <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">permissions</code> غير موجود في البيانات أعلاه، فيجب تشغيل هذا الأمر في Supabase SQL Editor:
                </p>
                <pre className="bg-slate-900 text-emerald-400 p-4 rounded text-xs font-mono">
                    ALTER TABLE "user_roles" ADD COLUMN "permissions" jsonb;
                </pre>
            </div>
        </div>
    );
}
