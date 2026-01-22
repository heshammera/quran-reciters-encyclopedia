import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export interface RecordingsFilters {
    search: string;
    reciterId: string | null;
    surahNumber: number | null;
    type: 'all' | 'audio' | 'video';
    status: 'all' | 'published' | 'draft';
    dateRange: 'all' | 'week' | 'month' | 'year';
    sortBy: 'newest' | 'oldest' | 'alphabetical' | 'popular';
}

const DEFAULT_FILTERS: RecordingsFilters = {
    search: '',
    reciterId: null,
    surahNumber: null,
    type: 'all',
    status: 'all',
    dateRange: 'all',
    sortBy: 'newest'
};

export function useRecordingsFilters() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Parse current filters from URL
    const filters: RecordingsFilters = useMemo(() => ({
        search: searchParams.get('search') || DEFAULT_FILTERS.search,
        reciterId: searchParams.get('reciter') || DEFAULT_FILTERS.reciterId,
        surahNumber: searchParams.get('surah') ? parseInt(searchParams.get('surah')!) : DEFAULT_FILTERS.surahNumber,
        type: (searchParams.get('type') as RecordingsFilters['type']) || DEFAULT_FILTERS.type,
        status: (searchParams.get('status') as RecordingsFilters['status']) || DEFAULT_FILTERS.status,
        dateRange: (searchParams.get('date') as RecordingsFilters['dateRange']) || DEFAULT_FILTERS.dateRange,
        sortBy: (searchParams.get('sort') as RecordingsFilters['sortBy']) || DEFAULT_FILTERS.sortBy
    }), [searchParams]);

    // Update a single filter
    const updateFilter = useCallback(<K extends keyof RecordingsFilters>(
        key: K,
        value: RecordingsFilters[K]
    ) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value === DEFAULT_FILTERS[key] || value === null || value === '') {
            params.delete(key === 'surahNumber' ? 'surah' :
                key === 'reciterId' ? 'reciter' :
                    key === 'dateRange' ? 'date' :
                        key === 'sortBy' ? 'sort' : key);
        } else {
            const paramKey = key === 'surahNumber' ? 'surah' :
                key === 'reciterId' ? 'reciter' :
                    key === 'dateRange' ? 'date' :
                        key === 'sortBy' ? 'sort' : key;
            params.set(paramKey, String(value));
        }

        router.push(`?${params.toString()}`, { scroll: false });
    }, [searchParams, router]);

    // Reset all filters
    const resetFilters = useCallback(() => {
        router.replace(window.location.pathname, { scroll: false });
    }, [router]);

    // Check if any filters are active
    const hasActiveFilters = useMemo(() => {
        return Object.keys(filters).some(
            key => filters[key as keyof RecordingsFilters] !== DEFAULT_FILTERS[key as keyof RecordingsFilters]
        );
    }, [filters]);

    return {
        filters,
        updateFilter,
        resetFilters,
        hasActiveFilters
    };
}
