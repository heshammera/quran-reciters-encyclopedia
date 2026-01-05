
import SessionGenerator from "@/components/session/SessionGenerator";

export const metadata = {
    title: "جلسة استماع | موسوعة قراء القرآن",
    description: "أنشئ قائمة تشغيل قرآنية مخصصة حسب القارئ والوقت.",
};

export default function SessionPage() {
    return (
        <main className="container mx-auto px-4 py-12 min-h-[80vh] flex flex-col items-center justify-center">
            <div className="w-full max-w-lg space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                        جلسة استماع قرآنية
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                        استرخِ واستمع.. دعنا نختار لك أجمل التلاوات
                    </p>
                </div>

                <SessionGenerator />

                <div className="text-center pt-8">
                    <p className="text-sm text-slate-500">
                        هل تبحث عن قارئ معين؟ <a href="/" className="text-emerald-600 hover:underline">تصفح الفهرس</a>
                    </p>
                </div>
            </div>
        </main>
    );
}
