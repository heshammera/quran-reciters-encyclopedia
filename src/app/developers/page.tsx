
import Link from "next/link";

export default function DevelopersPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        الواجهة البرمجية (API) 🛠️
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl">
                        توفر موسوعة قراء القرآن واجهة برمجية مفتوحة (Read-only) للمطورين والباحثين لتسهيل الوصول للأرشيف وبناء تطبيقات قرآنية جديدة.
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-4xl space-y-12">

                    {/* General Rules */}
                    <section className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-amber-800 dark:text-amber-400 mb-3">قواعد الاستخدام</h2>
                        <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                            <li>الواجهة للقراءة فقط حالياً.</li>
                            <li>لا تتضمن الواجهة روابط الملفات الصوتية المباشرة لحماية الباندويث.</li>
                            <li>يُرجى ذكر المصدر عند استخدام البيانات في مشاريع أخرى.</li>
                        </ul>
                    </section>

                    {/* Endpoints */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Endpoints</h2>

                            <div className="space-y-6">
                                {/* Reciters */}
                                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded text-xs font-mono font-bold">GET</span>
                                        <code className="text-slate-900 dark:text-white font-bold">/api/v1/reciters</code>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">جلب قائمة القراء مع إمكانية البحث.</p>
                                    <div className="space-y-4">
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Parameters:</div>
                                        <ul className="text-sm space-y-2 text-slate-600 dark:text-slate-400">
                                            <li><code className="bg-slate-100 dark:bg-slate-900 px-1 rounded">query</code>: نص للبحث في اسم القارئ.</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Recordings */}
                                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded text-xs font-mono font-bold">GET</span>
                                        <code className="text-slate-900 dark:text-white font-bold">/api/v1/recordings</code>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">بحث متقدم في التسجيلات الأرشيفية.</p>
                                    <div className="space-y-4">
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Parameters:</div>
                                        <ul className="text-sm space-y-2 text-slate-600 dark:text-slate-400">
                                            <li><code className="bg-slate-100 dark:bg-slate-900 px-1 rounded">reciter_id</code>: فلترة حسب القارئ.</li>
                                            <li><code className="bg-slate-100 dark:bg-slate-900 px-1 rounded">surah</code>: رقم السورة (1-114).</li>
                                            <li><code className="bg-slate-100 dark:bg-slate-900 px-1 rounded">section</code>: معرف القسم (مرتل، مجود، إلخ).</li>
                                            <li><code className="bg-slate-100 dark:bg-slate-900 px-1 rounded">city</code>: اسم المدينة.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
