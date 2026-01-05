
import { supabase } from "@/lib/supabase/client";

interface ValidationResult {
    isValid: boolean;
    error?: string;
    maxAyah?: number;
    surahName?: string;
}

/**
 * Validates if the given Ayah range exists within the Surah
 */
export async function validateAyahRange(surahNumber: number, fromAyah: number, toAyah: number): Promise<ValidationResult> {
    if (surahNumber < 1 || surahNumber > 114) {
        return { isValid: false, error: "رقم السورة غير صحيح (1-114)" };
    }

    if (fromAyah > toAyah) {
        return { isValid: false, error: "بداية النطاق يجب أن تكون قبل نهايته" };
    }

    // Get max verses for this surah from quran_index
    // We can cache this or use a lightweight query. Since we seeded quran_index, let's use it.
    // Optimization: create a static map of max verses to avoid DB hits for this simple check?
    // For now, let's just query to be 100% sure against the DB index.

    // Better: Get accurate count for this surah
    const { count, error } = await supabase
        .from('quran_index')
        .select('*', { count: 'exact', head: true })
        .eq('surah_number', surahNumber);

    if (error || count === null) {
        return { isValid: false, error: "تعذر التحقق من السورة في قاعدة البيانات" };
    }

    const maxVerses = count;

    if (fromAyah < 1 || toAyah > maxVerses) {
        return {
            isValid: false,
            error: `نطاق الآيات غير صحيح. السورة تحتوي على ${maxVerses} آية فقط.`,
            maxAyah: maxVerses
        };
    }

    return { isValid: true };
}

/**
 * Checks if a recording already exists for this exact coverage (Deduplication)
 * This warns the admin if we already have "Al-Fatihah" by "Minshawi" from "1970"
 */

export async function checkDuplicateCoverage(reciterId: string, surahNumber: number, fromAyah: number, toAyah: number, excludeRecordingId?: string): Promise<boolean> {
    // We check the recordings table directly, filtering by reciter
    // And then we need to check if that recording has the same coverage?
    // Actually, coverage is in recording_coverage table.

    // Query recording_coverage for matching segments, then check reciter via join
    const { data, error } = await supabase
        .from('recording_coverage')
        .select(`
            recording_id,
            surah_number,
            start_ayah,
            end_ayah,
            recordings (
                id,
                reciter_id
            )
        `)
        .eq('surah_number', surahNumber)
        .eq('start_ayah', fromAyah)
        .eq('end_ayah', toAyah);

    if (error) {
        console.error("Error checking duplicates:", JSON.stringify(error, null, 2));
        // Don't block the user if duplicate check fails
        return false;
    }

    if (!data || data.length === 0) {
        return false;
    }

    // Filter by reciter and exclude current recording if editing
    const duplicates = data.filter((row: any) => {
        // Handle the case where recordings might be null or an array
        const recording = Array.isArray(row.recordings) ? row.recordings[0] : row.recordings;
        return recording && recording.reciter_id === reciterId && row.recording_id !== excludeRecordingId;
    });

    return duplicates.length > 0;
}

export interface SoftValidationWarning {
    field: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
}

/**
 * Performs non-blocking checks on recording metadata
 * Returns a list of warnings (empty if all good)
 */
export function validateRecordingMetadata(data: {
    year?: number;
    duration_seconds?: number;
    city?: string;
    quality_level?: string;
}): SoftValidationWarning[] {
    const warnings: SoftValidationWarning[] = [];
    const currentYear = new Date().getFullYear();

    // 1. Logic Checks on Date
    if (data.year) {
        if (data.year > currentYear) {
            warnings.push({ field: 'year', message: `السنة (${data.year}) في المستقبل!`, severity: 'high' });
        }
        if (data.year < 1900) {
            warnings.push({ field: 'year', message: `السنة (${data.year}) قديمة جداً، هل أنت متأكد؟`, severity: 'medium' });
        }
    }

    // 2. Duration Checks
    if (data.duration_seconds !== undefined) {
        if (data.duration_seconds === 0) {
            warnings.push({ field: 'duration', message: "المدة 0. يفضل تحديد مدة التسجيل.", severity: 'medium' });
        }
        if (data.duration_seconds > 10800) { // > 3 hours
            warnings.push({ field: 'duration', message: "المدة طويلة جداً (> 3 ساعات).", severity: 'low' });
        }
    }

    // 3. Completeness Checks
    if (!data.city || data.city.length < 2) {
        warnings.push({ field: 'city', message: "لم يتم تحديد المدينة.", severity: 'low' });
    }

    /* 
    if (!data.quality_level) {
        warnings.push({ field: 'quality', message: "لم يتم تحديد مستوى الجودة.", severity: 'low' });
    }
    */

    return warnings;
}

