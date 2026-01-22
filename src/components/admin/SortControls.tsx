"use client";

import { RecordingsFilters } from '@/hooks/useRecordingsFilters';
import { ArrowUpDown } from 'lucide-react';

interface SortControlsProps {
    value: RecordingsFilters['sortBy'];
    onChange: (value: RecordingsFilters['sortBy']) => void;
}

const SORT_OPTIONS = [
    { value: 'newest', label: '🕐 الأحدث أولاً', icon: '⬇️' },
    { value: 'oldest', label: '🕑 الأقدم أولاً', icon: '⬆️' },
    { value: 'alphabetical', label: '🔤 أبجدي (أ-ي)', icon: 'أ' },
    { value: 'popular', label: '📊 الأكثر استماعاً', icon: '⭐' }
] as const;

export default function SortControls({ value, onChange }: SortControlsProps) {
    const currentOption = SORT_OPTIONS.find(opt => opt.value === value) || SORT_OPTIONS[0];

    return (
        <div className="relative inline-block">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ترتيب حسب
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value as RecordingsFilters['sortBy'])}
                className="appearance-none px-4 py-2.5 pr-10 rounded-lg border-2 border-gray-200 
                         dark:border-gray-700 bg-white dark:bg-gray-800 
                         text-gray-900 dark:text-white font-medium
                         hover:border-emerald-500 dark:hover:border-emerald-400
                         focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                         outline-none transition-all cursor-pointer min-w-[200px]"
            >
                {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <div className="absolute left-3 top-[38px] pointer-events-none">
                <ArrowUpDown className="w-5 h-5 text-gray-400" />
            </div>
        </div>
    );
}
