import { redirect } from "next/navigation";
import { getUser, isAdmin } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getUser();
    const admin = await isAdmin();

    if (!user) {
        redirect("/admin/login");
    }

    if (!admin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 font-sans" dir="rtl">
                <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md border border-red-100 dark:border-red-900/30">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        غير مصرح لك بالوصول
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        عذراً، هذا الحساب ({user.email}) لا يملك صلاحيات الدخول إلى لوحة الإدارة.
                    </p>
                    <div className="space-y-3">
                        <Link href="/" className="block w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors">
                            العودة للرئيسية
                        </Link>
                        <form action="/api/auth/signout" method="POST">
                            <button className="block w-full py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium">
                                تسجيل خروج
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900" dir="rtl">
            {/* Admin Header */}
            {/* Admin Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
                {/* Top Bar: Identity & Actions */}
                <div className="border-b border-slate-100 dark:border-slate-700/50">
                    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                        {/* Logo & Title */}
                        <Link href="/admin" className="flex items-center gap-3 shrink-0">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1 shadow-sm overflow-hidden border border-slate-100 dark:border-slate-700">
                                <img src="/logo.png" alt="" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-xl font-bold text-slate-900 dark:text-white hidden sm:inline">
                                لوحة الإدارة
                            </span>
                        </Link>

                        {/* User Actions */}
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                target="_blank"
                                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                <span className="hidden sm:inline">معاينة الموقع</span>
                            </Link>

                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

                            <div className="flex items-center gap-3">
                                <div className="text-sm text-slate-600 dark:text-slate-400 hidden sm:block truncate max-w-[150px]">
                                    {user.email}
                                </div>
                                <form action="/api/auth/signout" method="POST">
                                    <button
                                        type="submit"
                                        className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        خروج
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar: Navigation */}
                <div className="w-full px-4 border-t border-slate-100 dark:border-slate-700/50">
                    <nav className="flex gap-1 overflow-x-auto py-2 scrollbar-hide text-sm mask-linear-fade justify-between items-center">
                        <Link
                            href="/admin"
                            className="px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium whitespace-nowrap transition-colors"
                        >
                            الرئيسية
                        </Link>
                        <Link
                            href="/admin/reciters"
                            className="px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium whitespace-nowrap transition-colors"
                        >
                            القرّاء
                        </Link>
                        <Link
                            href="/admin/recordings"
                            className="px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium whitespace-nowrap transition-colors"
                        >
                            الصوتيات
                        </Link>
                        <Link
                            href="/admin/videos"
                            className="px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium whitespace-nowrap transition-colors"
                        >
                            المرئيات
                        </Link>
                        <Link
                            href="/admin/sections"
                            className="px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium whitespace-nowrap transition-colors"
                        >
                            الأقسام
                        </Link>
                        <Link
                            href="/admin/collections"
                            className="px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium whitespace-nowrap transition-colors"
                        >
                            المجموعات
                        </Link>

                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2 self-center shrink-0"></div>

                        <Link
                            href="/admin/incomplete"
                            className="px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 font-medium text-sm flex items-center gap-1.5 whitespace-nowrap transition-colors"
                        >
                            <span>⚠️</span>
                            النواقص
                        </Link>
                        <Link
                            href="/admin/users"
                            className="px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-medium text-sm flex items-center gap-1.5 whitespace-nowrap transition-colors"
                        >
                            <span>👥</span>
                            الأعضاء
                        </Link>
                        <Link
                            href="/admin/pages"
                            className="px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium text-sm flex items-center gap-1.5 whitespace-nowrap transition-colors"
                        >
                            <span>📝</span>
                            الصفحات
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
}
