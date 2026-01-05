/**
 * Normalizes Arabic text for better search matching
 */
export function normalizeArabicSearch(text: string): string {
    if (!text) return "";

    return text
        // Remove Harakat (vowels)
        .replace(/[\u064B-\u0652]/g, "")
        // Standardize Alif
        .replace(/[أإآ]/g, "ا")
        // Standardize Ya and Alef Maksoura - for the pattern, we'll replace with a wildcard later in the tool
        .replace(/[ىي]/g, "ي")
        // Standardize Ha and Ta Marbouta
        .replace(/ة/g, "ه")
        // Remove multiple spaces
        .replace(/\s+/g, " ")
        .trim();
}
