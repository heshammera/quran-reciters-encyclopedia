"use client";

import { RecordingsFilters } from '@/hooks/useRecordingsFilters';
import { getSurahName } from '@/lib/quran-helpers';
import { RotateCcw, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface RecordingsSidebarProps {
    filters: RecordingsFilters;
    onFilterChange: <K extends keyof RecordingsFilters>(key: K, value: RecordingsFilters[K]) => void;
    onReset: () => void;
    reciters: Array<{ id: string; name_ar: string }>;
}

export default function RecordingsSidebar({ filters, onFilterChange, onReset, reciters }: RecordingsSidebarProps) {
    const [openSections, setOpenSections] = useState({
        reciter: true,
        surah: false,
        status: true,
        date: true
    });

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    return (
        <aside className="w-80 bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">فلاتر البحث</h2>
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 
                             dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    إعادة تعيين
                </button>
            </div>

            <div className="space-y-6">
                {/* Reciter Filter */}
                <FilterSection
                    title="حسب القارئ"
                    isOpen={openSections.reciter}
                    onToggle={() => toggleSection('reciter')}
                >
                    <select
                        value={filters.reciterId || ''}
                        onChange={(e) => onFilterChange('reciterId', e.target.value || null)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                                 outline-none transition-all"
                    >
                        <option value="">الكل</option>
                        {reciters.map(reciter => (
                            <option key={reciter.id} value={reciter.id}>
                                {reciter.name_ar}
                            </option>
                        ))}
                    </select>
                </FilterSection>

                {/* Surah Filter */}
                <FilterSection
                    title="حسب السورة"
                    isOpen={openSections.surah}
                    onToggle={() => toggleSection('surah')}
                >
                    <select
                        value={filters.surahNumber || ''}
                        onChange={(e) => onFilterChange('surahNumber', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                                 outline-none transition-all max-h-60 overflow-y-auto"
                    >
                        <option value="">الكل</option>
                        {Array.from({ length: 114 }, (_, i) => i + 1).map(num => (
                            <option key={num} value={num}>
                                {getSurahName(num)}
                            </option>
                        ))}
                    </select>
                </FilterSection>



                {/* Status Filter */}
                <FilterSection
                    title="حسب الحالة"
                    isOpen={openSections.status}
                    onToggle={() => toggleSection('status')}
                >
                    <div className="space-y-2">
                        {[
                            { value: 'all', label: 'الكل' },
                            { value: 'published', label: '✅ منشور' },
                            { value: 'draft', label: '📝 مسودة' }
                        ].map(option => (
                            <label
                                key={option.value}
                                className="flex items-center gap-3 cursor-pointer group px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <input
                                    type="radio"
                                    name="status"
                                    value={option.value}
                                    checked={filters.status === option.value}
                                    onChange={() => onFilterChange('status', option.value as RecordingsFilters['status'])}
                                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                                <span className="text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 
                                               dark:group-hover:text-emerald-400 transition-colors flex-1 cursor-pointer select-none">
                                    {option.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </FilterSection>

                {/* Date Range Filter */}
                <FilterSection
                    title="حسب التاريخ"
                    isOpen={openSections.date}
                    onToggle={() => toggleSection('date')}
                >
                    <div className="space-y-2">
                        {[
                            { value: 'all', label: 'الكل' },
                            { value: 'week', label: '📅 آخر أسبوع' },
                            { value: 'month', label: '📅 آخر شهر' },
                            { value: 'year', label: '📅 آخر سنة' }
                        ].map(option => (
                            <label
                                key={option.value}
                                className="flex items-center gap-3 cursor-pointer group px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <input
                                    type="radio"
                                    name="dateRange"
                                    value={option.value}
                                    checked={filters.dateRange === option.value}
                                    onChange={() => onFilterChange('dateRange', option.value as RecordingsFilters['dateRange'])}
                                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                                <span className="text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 
                                               dark:group-hover:text-emerald-400 transition-colors flex-1 cursor-pointer select-none">
                                    {option.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </FilterSection>
            </div>
        </aside>
    );
}

interface FilterSectionProps {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

function FilterSection({ title, isOpen, onToggle, children }: FilterSectionProps) {
    return (
        <div className="border-b border-gray-200 dark:border-gray-800 pb-4 last:border-0">
            <button
                onClick={onToggle}
                className="flex items-center justify-between w-full text-right mb-3 group"
            >
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 
                             dark:group-hover:text-emerald-400 transition-colors">
                    {title}
                </h3>
                <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            {isOpen && <div className="animate-in fade-in slide-in-from-top-2 duration-200">{children}</div>}
        </div>
    );
}
