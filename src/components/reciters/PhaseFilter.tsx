"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface Phase {
    id: string;
    phase_name_ar: string;
    description_ar?: string;
}

interface PhaseFilterProps {
    phases: Phase[];
}

export default function PhaseFilter({ phases }: PhaseFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentPhase = searchParams.get("phase");

    if (!phases || phases.length === 0) return null;

    const handleSelect = (phaseId: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (phaseId) {
            params.set("phase", phaseId);
        } else {
            params.delete("phase");
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            <div className="flex items-center gap-2 min-w-max">
                <button
                    onClick={() => handleSelect(null)}
                    className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                        !currentPhase
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500"
                    )}
                >
                    كل الفترات
                </button>
                {phases.map((phase) => (
                    <button
                        key={phase.id}
                        onClick={() => handleSelect(phase.id)}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                            currentPhase === phase.id
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500"
                        )}
                        title={phase.description_ar}
                    >
                        {phase.phase_name_ar}
                    </button>
                ))}
            </div>
        </div>
    );
}
