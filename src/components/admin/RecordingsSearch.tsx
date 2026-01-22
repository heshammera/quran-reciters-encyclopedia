"use client";

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface RecordingsSearchProps {
    value: string;
    onChange: (value: string) => void;
}

export default function RecordingsSearch({ value, onChange }: RecordingsSearchProps) {
    const [localValue, setLocalValue] = useState(value);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            onChange(localValue);
        }, 300);

        return () => clearTimeout(timer);
    }, [localValue, onChange]);

    // Sync with external value changes
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    return (
        <div className="w-full">
            <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    placeholder="ابحث في العنوان، القارئ، أو السورة..."
                    className="w-full pl-4 pr-12 py-3 rounded-xl border-2 border-gray-200 
                             focus:border-emerald-500 focus:ring-0 outline-none
                             dark:bg-gray-800 dark:border-gray-700 dark:text-white
                             transition-colors text-base"
                />
                {localValue && (
                    <button
                        onClick={() => {
                            setLocalValue('');
                            onChange('');
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 
                                 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                                 transition-colors"
                        aria-label="مسح البحث"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
}
