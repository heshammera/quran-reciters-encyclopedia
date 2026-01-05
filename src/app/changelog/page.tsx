
import { getChangeLogs } from "@/app/actions/changelog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const metadata = {
    title: "سجل التغييرات | موسوعة قراء القرآن",
    description: "تاريخ التحديثات والإصدارات للموسوعة",
};

export default async function ChangeLogPage() {
    const logs = await getChangeLogs(true); // Public only

    return (
        <main className="container mx-auto px-4 py-12">
            <header className="text-center mb-16">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                    سجل التغييرات
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    تابع آخر التحديثات والإضافات للموسوعة
                </p>
            </header>

            <div className="max-w-3xl mx-auto space-y-12">
                {logs.map((log, index) => (
                    <div key={log.id} className="relative pl-8 sm:pl-0">
                        {/* Timeline Line */}
                        {index !== logs.length - 1 && (
                            <div className="absolute top-12 left-0 sm:left-auto sm:right-[-2px] bottom-[-48px] w-px bg-slate-200 dark:bg-slate-700 hidden sm:block h-full opacity-50"></div>
                        )}

                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 relative">
                            {/* Badge */}
                            <div className={`absolute -top-3 left-8 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${log.change_type === 'major' ? 'bg-purple-100 text-purple-700' :
                                    log.change_type === 'feature' ? 'bg-emerald-100 text-emerald-700' :
                                        'bg-slate-100 text-slate-700'
                                }`}>
                                {log.version}
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-4 mt-2">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {log.title}
                                </h2>
                                <time className="text-sm text-slate-500 font-mono">
                                    {new Date(log.release_date).toLocaleDateString("ar-EG", { year: 'numeric', month: 'long', day: 'numeric' })}
                                </time>
                            </div>

                            <div className="prose prose-sm dark:prose-invert max-w-none prose-ul:list-disc prose-li:marker:text-emerald-500">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {log.description_markdown}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
