import ComparisonInterface from "@/components/compare/ComparisonInterface";

export const metadata = {
    title: "مقارنة التلاوات | موسوعة قراء القرآن",
    description: "قارن بين تلاوات مختلفة لنفس الآيات من قراء متعددين",
};

export default function ComparePage() {
    return (
        <main className="container mx-auto px-4 py-12 min-h-[80vh]">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                        مقارنة التلاوات
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                        استمع لنفس الآيات بأصوات قراء مختلفين وتأمل في الأداء والتجويد
                    </p>
                </header>

                <ComparisonInterface />

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                    <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                        <span>ℹ️</span>
                        كيفية الاستخدام
                    </h3>
                    <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                        <li>اختر رقم السورة ونطاق الآيات التي تريد مقارنتها</li>
                        <li>سيظهر لك جميع القراء الذين لديهم تسجيلات تغطي هذا النطاق</li>
                        <li>يمكنك تشغيل كل قارئ على حدة أو تشغيل الكل متتالياً</li>
                        <li>هذا النظام للاستماع والتأمل فقط، وليس للتقييم</li>
                    </ul>
                </div>
            </div>
        </main>
    );
}
