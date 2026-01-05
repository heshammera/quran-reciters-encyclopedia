
"use client";

import { useState } from "react";
import { createDonationPledge } from "@/app/actions/user-preferences";

export default function DonationForm() {
    const [amount, setAmount] = useState(20);
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await createDonationPledge(amount, notes);
            if (res.success) {
                setSuccess(true);
            } else {
                alert("حدث خطأ: " + res.error);
            }
        } catch (err: any) {
            alert("حدث خطأ غير متوقع");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-8 text-center">
                <div className="text-4xl mb-4">🙏</div>
                <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">شكراً لمبادرتك!</h3>
                <p className="text-emerald-800 dark:text-emerald-300">
                    تم تسجيل طلب التبرع بنجاح. سنقوم بمراجعة الطلب وتفعيل ميزات "الداعم" لحسابك قريباً.
                </p>
                <button
                    onClick={() => setSuccess(false)}
                    className="mt-6 text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                    تقديم تبرع آخر
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
            <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                <span>💳</span>
                تسجيل تبرع (التزام)
            </h3>

            <p className="text-sm text-slate-500 mb-6">
                يرجى ملاحظة أن هذا النموذج لتسجيل "نية التبرع" أو الإبلاغ عن تبرع تم بالفعل عبر منصات خارجية (مثل تبرعات Archive.org). بمجرد التأكد، ستحصل على شارة "داعم".
            </p>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">المبلغ (بالدولار تقريباً)</label>
                    <div className="grid grid-cols-4 gap-2">
                        {[5, 20, 50, 100].map(val => (
                            <button
                                key={val}
                                type="button"
                                onClick={() => setAmount(val)}
                                className={`py-2 rounded-lg border font-bold transition-all ${amount === val
                                        ? "bg-emerald-600 text-white border-emerald-600"
                                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                    }`}
                            >
                                ${val}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">ملاحظات إضافية (رقم المعاملة أو وسيلة التبرع)</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="اختياري: مثلاً 'تبرعت عبر أرشيف بنفس البريد الإلكتروني'"
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 h-24"
                    />
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
                    ⚠️ يجب أن تكون مسجلاً للدخول لتتمكن من الحصول على مزايا الداعمين تلقائياً.
                </div>

                <button
                    disabled={loading}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                    {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "إرسال الطلب"}
                </button>
            </div>
        </form>
    );
}
