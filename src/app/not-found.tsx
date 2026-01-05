export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-slate-900 dark:text-white mb-4">404</h1>
                <p className="text-2xl text-slate-600 dark:text-slate-400 mb-8">
                    الصفحة غير موجودة
                </p>
                <a
                    href="/"
                    className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    العودة للرئيسية
                </a>
            </div>
        </div>
    );
}
