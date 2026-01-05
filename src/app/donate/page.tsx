
import Link from "next/link";
import { Metadata } from "next";
import DonationForm from "@/components/donation/DonationForm";

export const metadata: Metadata = {
    title: "ساهم في استمرار الموسوعة | موسوعة قرّاء القرآن",
    description: "ساهم في حفظ ونشر التراث القرآني من خلال دعم الاستضافة والتطوير.",
};

export default function DonationPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            {/* Hero Section */}
            <div className="relative bg-teal-900 text-white py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-10 pattern-grid-lg"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>

                <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm mb-6">
                        <span>🌱</span>
                        <span>صدقة جارية</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 !leading-tight">
                        ساهم في حفظ <span className="text-emerald-400">تراث التلاوات</span> للأجيال القادمة
                    </h1>
                    <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                        مشروع "موسوعة قرّاء القرآن" هو مبادرة غير ربحية تهدف لجمع وتنقيح وعرض آلاف التلاوات النادرة والمنسية.
                        دعمك يساعدنا في تغطية تكاليف السيرفرات والتخزين الضخمة وضمان بقاء الموقع مجانياً وخالياً من الإعلانات.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-10 relative z-20">
                {/* Donation Cards */}
                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {/* Tier 1: One-time */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center text-center transform hover:-translate-y-1 transition-transform duration-300">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-3xl mb-4">
                            ☕
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">داعم عابر</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-1">
                            مساهمة بسيطة تعادل كوب قهوة، لكنها تعني لنا الكثير وتساعد في استمرار العمل ليوم آخر.
                        </p>
                        <div className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-6 font-mono">
                            $5
                        </div>
                        <Link href="#pledge" className="w-full py-3 px-6 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors text-center">
                            سجل التبرع
                        </Link>
                    </div>

                    {/* Tier 2: Monthly (Popular) */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl ring-2 ring-emerald-500 p-6 flex flex-col items-center text-center relative overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 scale-105">
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                            الأكثر اختياراً
                        </div>
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-3xl mb-4 text-emerald-600 dark:text-emerald-400">
                            🛡️
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">حارس التراث</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-1">
                            مساهمة شهرية تضمن استقرار السيرفرات وتمكننا من إضافة المزيد من التلاوات عالية الجودة.
                        </p>
                        <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-6 font-mono">
                            $20
                            <span className="text-sm text-slate-400 font-normal"> / شهر</span>
                        </div>
                        <Link href="#pledge" className="w-full py-3 px-6 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30 text-center">
                            سجل التبرع
                        </Link>
                    </div>

                    {/* Tier 3: Sponsorship */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center text-center transform hover:-translate-y-1 transition-transform duration-300">
                        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-3xl mb-4 text-amber-600 dark:text-amber-400">
                            🏛️
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">شريك مؤسس</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-1">
                            دعم كبير يساعد في تمويل تطوير ميزات جديدة (مثل تطبيقات الهاتف) وتوسيع فريق العمل.
                        </p>
                        <div className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-6 font-mono">
                            $100+
                        </div>
                        <Link href="/contact" className="w-full py-3 px-6 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors text-center">
                            تواصل معنا
                        </Link>
                    </div>
                </div>

                {/* Benefits Section */}
                <div id="pledge" className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto mt-24 items-start border-t border-slate-200 dark:border-slate-800 pt-16">
                    {/* Left: Benefits */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                                مزايا الداعمين (Supporters) 🌟
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-8">
                                بمجرد انضمامك لقائمة الداعمين وتوثيق مساهمتك، سنقوم بتفعيل ميزات إضافية لحسابك تقديراً منا:
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { title: "حفظ التفضيلات سحابياً", desc: "سيتم حفظ إعداداتك (مثل وضع التقشف Lean Mode) لتعمل على جميع أجهزتك تلقائياً.", icon: "☁️" },
                                { title: "إيقاف تنبيهات الدعم", desc: "سنقوم بإظهار عدد أقل من رسائل طلب الدعم تقديراً لمساهمتك السابقة.", icon: "🚫" },
                                { title: "شعار الداعم", desc: "ظهور شارة 'داعم' بجانب اسمك في واجهة المستخدم (قريباً).", icon: "💎" },
                                { title: "حفظ مستوى الصوت", desc: "المشغل سيتذكر مستوى الصوت المفضل لديك دائماً.", icon: "🔊" }
                            ].map((benefit, i) => (
                                <div key={i} className="flex gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <div className="text-2xl">{benefit.icon}</div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">{benefit.title}</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{benefit.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Form */}
                    <DonationForm />
                </div>

                {/* FAQ / Transparency */}
                <div className="max-w-3xl mx-auto mt-20">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
                        لماذا نحتاج لدعمك؟
                    </h2>
                    <div className="grid gap-6">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-200">🔍 أين تذهب الأموال؟</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                                100% من التبرعات تذهب مباشرة لتغطية تكاليف استضافة الملفات الصوتية (Bandwidth & Storage)، وحجز النطاق (Domain)، وخدمات قواعد البيانات. لا نتربح شخصياً من هذا المشروع.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-200">🚫 لماذا لا نستخدم الإعلانات؟</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                                نؤمن بقدسية القرآن الكريم وأنه لا ينبغي أن يختلط بإعلانات تجارية قد تكون غير ملائمة. نريد توفير تجربة استماع خاشعة ونقية تماماً.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Back Home */}
                <div className="text-center mt-16">
                    <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline">
                        العودة للرئيسية
                    </Link>
                </div>
            </div>
        </div>
    );
}
