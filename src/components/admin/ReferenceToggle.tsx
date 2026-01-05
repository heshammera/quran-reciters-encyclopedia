
"use client";

import { useState } from "react";
import { setReferenceTrack, removeReferenceTrack } from "@/app/actions/reference-tracks";

interface ReferenceToggleProps {
    reciterId: string;
    sectionId: string;
    surahNumber: number;
    recordingId: string;
    isReference: boolean;
    hasOtherReference: boolean;
    referenceId?: string;
}

export default function ReferenceToggle({
    reciterId, sectionId, surahNumber, recordingId,
    isReference, hasOtherReference, referenceId
}: ReferenceToggleProps) {
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        if (loading) return;
        setLoading(true);
        try {
            if (isReference && referenceId) {
                if (confirm("هل تريد إلغاء اعتماد هذا التسجيل كنسخة مرجعيه؟")) {
                    await removeReferenceTrack(referenceId, reciterId);
                }
            } else {
                let reason = "جودة عالية"; // Default
                // Could open a modal here, but prompt is simpler for now
                // reason = prompt("سبب الاعتماد (مثال: النسخة الإذاعية، الأعلى جودة...)", "جودة عالية") || "جودة عالية";

                const msg = hasOtherReference
                    ? "يوجد نسخة مرجعية أخرى مسجلة لهذه السورة. هل تريد استبدالها بهذه النسخة؟"
                    : "هل تريد اعتماد هذا التسجيل كالنسخة المرجعية لهذه السورة؟";

                if (confirm(msg)) {
                    await setReferenceTrack(reciterId, sectionId, surahNumber, recordingId, reason);
                }
            }
        } catch (err) {
            alert("حدث خطأ");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`text-xl transition-all ${isReference
                    ? "grayscale-0 scale-110 opacity-100"
                    : "grayscale opacity-20 hover:opacity-50 hover:grayscale-0 hover:scale-110"
                }`}
            title={isReference ? "نسخة مرجعية (اضغط للإلغاء)" : "اضغط للتعيين كنسخة مرجعية"}
        >
            👑
        </button>
    );
}
