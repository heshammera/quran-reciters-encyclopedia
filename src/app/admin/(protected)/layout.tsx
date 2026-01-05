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
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between h-auto lg:h-16 py-3 lg:py-0 gap-4">
                        <div className="flex items-center gap-4 lg:gap-8 overflow-hidden">
                            <Link href="/admin" className="flex items-center gap-3 shrink-0">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1 shadow-sm overflow-hidden border border-slate-100 dark:border-slate-700">
                                    <img src="/logo.png" alt="" className="w-full h-full object-contain" />
                                </div>
                                <span className="text-xl font-bold text-slate-900 dark:text-white hidden sm:inline">
                                    لوحة الإدارة
                                </span>
                            </Link>

                            <nav className="flex gap-4 lg:gap-6 overflow-x-auto pb-1 lg:pb-0 scrollbar-hide text-sm lg:text-base mask-linear-fade">
                                <Link
                                    href="/admin"
                                    className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium whitespace-nowrap"
                                >
                                    الرئيسية
                                </Link>
                                <Link
                                    href="/admin/reciters"
                                    className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium whitespace-nowrap"
                                >
                                    القرّاء
                                </Link>
                                <Link
                                    href="/admin/recordings"
                                    className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium whitespace-nowrap"
                                >
                                    الصوتيات
                                </Link>
                                <Link
                                    href="/admin/videos"
                                    className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium whitespace-nowrap"
                                >
                                    المرئيات
                                </Link>
                                <Link
                                    href="/admin/sections"
                                    className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium whitespace-nowrap"
                                >
                                    الأقسام
                                </Link>
                                <Link
                                    href="/admin/collections"
                                    className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium whitespace-nowrap"
                                >
                                    المجموعات
                                </Link>
                                <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0"></div>
                                <Link
                                    href="/admin/incomplete"
                                    className="text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 font-medium text-xs lg:text-sm flex items-center gap-1 whitespace-nowrap"
                                >
                                    <span>⚠️</span>
                                    النواقص
                                </Link>
                                <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0"></div>
                                <Link
                                    href="/admin/users"
                                    className="text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 font-medium text-xs lg:text-sm flex items-center gap-1 whitespace-nowrap"
                                >
                                    <span>👥</span>
                                    الأعضاء
                                </Link>
                                <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0"></div>
                                <Link
                                    href="/admin/pages"
                                    className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium text-xs lg:text-sm flex items-center gap-1 whitespace-nowrap"
                                >
                                    <span>📝</span>
                                    الصفحات
                                </Link>
                            </nav>
                        </div>

                        <div className="flex items-center justify-end gap-3 lg:gap-4 border-t lg:border-t-0 border-slate-100 dark:border-slate-700 pt-2 lg:pt-0">
                            <Link
                                href="/"
                                target="_blank"
                                className="text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 whitespace-nowrap"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                الموقع
                            </Link>
                            <div className="text-sm text-slate-600 dark:text-slate-400 hidden sm:block truncate max-w-[150px]">
                                {user.email}
                            </div>
                            <form action="/api/auth/signout" method="POST">
                                <button
                                    type="submit"
                                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 whitespace-nowrap"
                                >
                                    تسجيل خروج
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
}
