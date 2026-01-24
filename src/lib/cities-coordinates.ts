// Coordinates for major cities used in the encyclopedia
// Format: { CityName: [Latitude, Longitude] }

export const CITY_COORDINATES: Record<string, [number, number]> = {
    // Egypt
    "القاهرة": [30.0444, 31.2357],
    "الإسكندرية": [31.2001, 29.9187],
    "طنطا": [30.7865, 31.0004],
    "المنصورة": [31.0409, 31.3785],
    "الزقازيق": [30.5765, 31.5041],
    "دمنهور": [31.0424, 30.4635],
    "شبين الكوم": [30.5526, 31.0106],
    "بنها": [30.4660, 31.1853],
    "كفر الشيخ": [31.1107, 30.9388],
    "الفيوم": [29.3084, 30.8428],
    "بني سويف": [29.0661, 31.0994],
    "المنيا": [28.1099, 30.7503],
    "أسيوط": [27.1783, 31.1859],
    "سوهاج": [26.5591, 31.6957],
    "قنا": [26.1551, 32.7160],
    "الأقصر": [25.6872, 32.6396],
    "أسوان": [24.0889, 32.8998],
    "بورسعيد": [31.2653, 32.3019],
    "الإسماعيلية": [30.5965, 32.2715],
    "السويس": [29.9668, 32.5498],
    "دمياط": [31.4175, 31.8144],
    "مسجد الحسين": [30.0488, 31.2625],
    "السيدة زينب": [30.0344, 31.2384],
    "الجامع الأزهر": [30.0457, 31.2627],

    // International (Examples)
    "مكة المكرمة": [21.3891, 39.8579],
    "المدينة المنورة": [24.5247, 39.5692],
    "القدس": [31.7683, 35.2137],
    "دمشق": [33.5138, 36.2765],
    "الكويت": [29.3759, 47.9774],
    "الرباط": [34.0209, -6.8416],
    "بيروت": [33.8938, 35.5018],
    "لندن": [51.5074, -0.1278],
    "باريس": [48.8566, 2.3522]
};

// Fallback logic for grouping nearby locations if needed
// Or mapping specific mosque names to their city coordinates if not explicitly pinned
export function getCityCoordinates(cityName: string): [number, number] | null {
    if (!cityName) return null;

    // Normalize city name: remove common prefixes/suffixes, unify alef/ha/ya
    const normalize = (s: string) => s
        .trim()
        .replace(/[أإآ]/g, 'ا')      // Normalize Alef
        .replace(/ة/g, 'ه')          // Normalize Ta Marbuta to Ha
        .replace(/ى/g, 'ي');         // Normalize Alef Maqsura to Ya

    const normalizedInput = normalize(cityName);
    const lowerInput = cityName.toLowerCase().trim();

    // Check against normalized keys (Arabic)
    for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
        if (normalize(key) === normalizedInput) {
            return coords;
        }
    }

    // Keyword matching (Normalized Arabic)
    if (normalizedInput.includes(normalize("الحسين"))) return CITY_COORDINATES["مسجد الحسين"];
    if (normalizedInput.includes(normalize("زينب"))) return CITY_COORDINATES["السيدة زينب"];
    if (normalizedInput.includes(normalize("الأزهر"))) return CITY_COORDINATES["الجامع الأزهر"];
    if (normalizedInput.includes(normalize("مكة")) || normalizedInput.includes(normalize("الحرام"))) return CITY_COORDINATES["مكة المكرمة"];
    if (normalizedInput.includes(normalize("المدينة")) || normalizedInput.includes(normalize("النبوي"))) return CITY_COORDINATES["المدينة المنورة"];
    if (normalizedInput.includes(normalize("دمشق")) || normalizedInput.includes(normalize("الشام"))) return CITY_COORDINATES["دمشق"];
    if (normalizedInput.includes(normalize("الكويت"))) return CITY_COORDINATES["الكويت"];

    // Data Fixes (Mapping generic country names or mosques to cities)
    if (normalizedInput === "مصر") return CITY_COORDINATES["القاهرة"]; // Default Egypt to Cairo
    if (normalizedInput.includes("عبدالناصر")) return CITY_COORDINATES["الإسكندرية"]; // Assumption: Gamal Abdel Nasser Mosque in Alex
    if (normalizedInput.includes("الحسين")) return CITY_COORDINATES["مسجد الحسين"];
    if (normalizedInput.includes("زينب")) return CITY_COORDINATES["السيدة زينب"];

    // English Mapping
    if (lowerInput === "cairo") return CITY_COORDINATES["القاهرة"];
    if (lowerInput === "alexandria") return CITY_COORDINATES["الإسكندرية"];
    if (lowerInput === "tanta") return CITY_COORDINATES["طنطا"];
    if (lowerInput === "mansoura") return CITY_COORDINATES["المنصورة"];
    if (lowerInput === "zagazig") return CITY_COORDINATES["الزقازيق"];
    if (lowerInput === "minya") return CITY_COORDINATES["المنيا"];
    if (lowerInput === "sohag") return CITY_COORDINATES["سوهاج"];
    if (lowerInput === "luxor") return CITY_COORDINATES["الأقصر"];
    if (lowerInput === "aswan") return CITY_COORDINATES["أسوان"];
    if (lowerInput === "port said") return CITY_COORDINATES["بورسعيد"];
    if (lowerInput === "suez") return CITY_COORDINATES["السويس"];
    if (lowerInput === "ismailia") return CITY_COORDINATES["الإسماعيلية"];
    if (lowerInput === "fayoum") return CITY_COORDINATES["الفيوم"];
    if (lowerInput === "assiut" || lowerInput === "assuit") return CITY_COORDINATES["أسيوط"];
    if (lowerInput === "qena") return CITY_COORDINATES["قنا"];
    if (lowerInput === "damietta") return CITY_COORDINATES["دمياط"];
    if (lowerInput === "mecca") return CITY_COORDINATES["مكة المكرمة"];
    if (lowerInput === "medina") return CITY_COORDINATES["المدينة المنورة"];

    // Try finding any key contained in input or vice versa for loose matching
    for (const key of Object.keys(CITY_COORDINATES)) {
        const normKey = normalize(key);
        if (normalizedInput.includes(normKey) || normKey.includes(normalizedInput)) {
            return CITY_COORDINATES[key];
        }
    }

    return null;
}
