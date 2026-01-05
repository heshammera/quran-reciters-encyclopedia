"use client";

import { useLeanMode } from "@/context/LeanModeContext";

interface CityData {
    name: string;
    count: number;
}

interface ReciterCitiesProps {
    cities: CityData[];
    reciterName: string;
}

export default function ReciterCities({ cities, reciterName }: ReciterCitiesProps) {
    const { isLean } = useLeanMode();

    if (cities.length === 0) {
        return (
            <div className="text-center py-10 opacity-60">
                لا توجد بيانات جغرافية متاحة.
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className={`grid ${isLean ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'}`}>
                {cities.map((city) => (
                    <div
                        key={city.name}
                        className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-all group ${isLean ? 'p-3' : 'p-6'}`}
                    >
                        {!isLean && (
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                        )}
                        <h3 className={`font-bold text-slate-900 dark:text-white mb-1 ${isLean ? 'text-base' : 'text-lg'}`}>
                            {city.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {city.count} تلاوة
                        </p>
                    </div>
                ))}
            </div>

            {!isLean && (
                <div className="mt-12 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                        هذه الأماكن تمثل المدن التي وثقنا تلاوات للشيخ {reciterName} فيها.
                    </p>
                    {/* Placeholder for actual map */}
                    <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400">
                        <span className="flex items-center gap-2">
                            🗺️ الخريطة التفاعلية (قريباً)
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
