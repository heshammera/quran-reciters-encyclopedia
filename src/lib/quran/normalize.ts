/**
 * Arabic Text Normalization for Quran Search
 * Removes diacritics, normalizes hamza/alef/yaa variants, removes tatweel
 */

export function normalizeArabicText(text: string): string {
    if (!text) return '';

    let normalized = text;

    // Remove tashkeel (diacritics)
    normalized = normalized.replace(/[\u064B-\u0652]/g, ''); // Fatha, Damma, Kasra, Sukun, etc.
    normalized = normalized.replace(/[\u0653-\u065F]/g, ''); // Additional diacritics
    normalized = normalized.replace(/\u0670/g, ''); // Superscript Alef

    // Normalize Hamza variants
    normalized = normalized.replace(/[إأآا]/g, 'ا'); // All Alef variants to basic Alef
    normalized = normalized.replace(/[ؤئ]/g, 'ء'); // Hamza variants

    // Normalize Yaa variants
    normalized = normalized.replace(/[يى]/g, 'ي'); // Alef Maksura to Yaa

    // Normalize Taa Marbuta
    normalized = normalized.replace(/ة/g, 'ه'); // Taa Marbuta to Haa

    // Remove Tatweel (kashida)
    normalized = normalized.replace(/ـ/g, ''); // Tatweel character

    // Remove extra whitespace
    normalized = normalized.replace(/\s+/g, ' ').trim();

    return normalized;
}

/**
 * Prepare text for search (normalize + lowercase)
 */
export function prepareForSearch(text: string): string {
    return normalizeArabicText(text).toLowerCase();
}

/**
 * Check if searchText exists in targetText (both normalized)
 */
export function arabicTextMatch(searchText: string, targetText: string): boolean {
    const normalizedSearch = prepareForSearch(searchText);
    const normalizedTarget = prepareForSearch(targetText);
    return normalizedTarget.includes(normalizedSearch);
}

/**
 * Extract Ayah numbers from text (e.g., "الآية 5 إلى 10")
 * Returns {start, end} or null
 */
export function extractAyahRange(text: string): { start: number; end: number } | null {
    // Pattern for "آية X" or "الآية X"
    const singleMatch = text.match(/(?:الآية|آية)\s*(\d+)/);
    if (singleMatch) {
        const ayah = parseInt(singleMatch[1]);
        return { start: ayah, end: ayah };
    }

    // Pattern for range "من آية X إلى Y"
    const rangeMatch = text.match(/من\s*(?:آية|الآية)?\s*(\d+)\s*(?:إلى|الى|-)\s*(?:آية|الآية)?\s*(\d+)/);
    if (rangeMatch) {
        return {
            start: parseInt(rangeMatch[1]),
            end: parseInt(rangeMatch[2]),
        };
    }

    return null;
}

/**
 * Format Ayah range for display
 */
export function formatAyahRange(start: number, end: number): string {
    if (start === end) {
        return `الآية ${start}`;
    }
    return `الآيات ${start}-${end}`;
}

/**
 * Full list of Quran Surah names for local resolution
 */
const SURAH_NAMES: Record<number, string> = {
    1: 'الفاتحة', 2: 'البقرة', 3: 'آل عمران', 4: 'النساء', 5: 'المائدة', 6: 'الأنعام', 7: 'الأعراف', 8: 'الأنفال', 9: 'التوبة', 10: 'يونس',
    11: 'هود', 12: 'يوسف', 13: 'الرعد', 14: 'إبراهيم', 15: 'الحجر', 16: 'النحل', 17: 'الإسراء', 18: 'الكهف', 19: 'مريم', 20: 'طه',
    21: 'الأنبياء', 22: 'الحج', 23: 'المؤمنون', 24: 'النور', 25: 'الفرقان', 26: 'الشعراء', 27: 'النمل', 28: 'القصص', 29: 'العنكبوت', 30: 'الروم',
    31: 'لقمان', 32: 'السجدة', 33: 'الأحزاب', 34: 'سبأ', 35: 'فاطر', 36: 'يس', 37: 'الصافات', 38: 'ص', 39: 'الزمر', 40: 'غافر',
    41: 'فصلت', 42: 'الشورى', 43: 'الزخرف', 44: 'الدخان', 45: 'الجاثية', 46: 'الأحقاف', 47: 'محمد', 48: 'الفتح', 49: 'الحجرات', 50: 'ق',
    51: 'الذاريات', 52: 'الطور', 53: 'النجم', 54: 'القمر', 55: 'الرحمن', 56: 'الواقعة', 57: 'الحديد', 58: 'المجادلة', 59: 'الحشر', 60: 'الممتحنة',
    61: 'الصف', 62: 'الجمعة', 63: 'المنافقون', 64: 'التغابن', 65: 'الطلاق', 66: 'التحريم', 67: 'الملك', 68: 'القلم', 69: 'الحاقة', 70: 'المعارج',
    71: 'نوح', 72: 'الجن', 73: 'المزمل', 74: 'المدثر', 75: 'القيامة', 76: 'الإنسان', 77: 'المرسلات', 78: 'النبأ', 79: 'النازعات', 80: 'عبس',
    81: 'التكوير', 82: 'الانفطار', 83: 'المطففين', 84: 'الانشقاق', 85: 'البروج', 86: 'الطارق', 87: 'الأعلى', 88: 'الغاشية', 89: 'الفجر', 90: 'البلد',
    91: 'الشمس', 92: 'الليل', 93: 'الضحى', 94: 'الشرح', 95: 'التين', 96: 'العلق', 97: 'القدر', 98: 'البينة', 99: 'الزلزلة', 100: 'العاديات',
    101: 'القارعة', 102: 'التكاثر', 103: 'العصر', 104: 'الهمزة', 105: 'الفيل', 106: 'قريش', 107: 'الماعون', 108: 'الكوثر', 109: 'الكافرون', 110: 'النصر',
    111: 'المسد', 112: 'الإخلاص', 113: 'الفلق', 114: 'الناس'
};

/**
 * Get Surah name in Arabic by number
 */
export function getSurahName(surahNumber: number): string {
    return SURAH_NAMES[surahNumber] || `سورة ${surahNumber}`;
}

/**
 * Find Surah number by name (uses fuzzy normalization match)
 */
export function findSurahNumber(name: string): number | null {
    if (!name) return null;
    const normalizedQuery = normalizeArabicText(name).replace(/سوره\s+/g, '').trim();

    // Exact match after normalization
    for (const [num, sName] of Object.entries(SURAH_NAMES)) {
        if (normalizeArabicText(sName) === normalizedQuery) {
            return parseInt(num);
        }
    }

    // Partial match
    for (const [num, sName] of Object.entries(SURAH_NAMES)) {
        if (normalizeArabicText(sName).includes(normalizedQuery)) {
            return parseInt(num);
        }
    }

    return null;
}
