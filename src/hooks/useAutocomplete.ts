"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Hook ذكي لتوفير Autocomplete للحقول النصية
 * يجلب القيم الفريدة من قاعدة البيانات ويخزنها في cache
 * 
 * @param fieldName - اسم العمود في جدول recordings
 * @returns مصفوفة من القيم المقترحة
 * 
 * @example
 * const citySuggestions = useAutocomplete('city');
 * // Returns: ['مصر', 'السعودية', 'الأردن', ...]
 */
export function useAutocomplete(fieldName: string): string[] {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cacheKey = `autocomplete_${fieldName}`;

        // 1. محاولة الجلب من localStorage أولاً (سريع)
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                setSuggestions(parsed);
                setLoading(false);
            } catch (e) {
                console.warn(`Failed to parse cached autocomplete for ${fieldName}`, e);
            }
        }

        // 2. جلب القيم من قاعدة البيانات (تحديث)
        const fetchSuggestions = async () => {
            try {
                const { data, error } = await supabase
                    .from("recordings")
                    .select(fieldName)
                    .not(fieldName, "is", null)
                    .limit(200); // حد معقول لتجنب البطء

                if (error) {
                    console.error(`Error fetching autocomplete for ${fieldName}:`, error);
                    setLoading(false);
                    return;
                }

                if (data && data.length > 0) {
                    // استخراج القيم الفريدة وترتيبها
                    const uniqueValues = [
                        ...new Set(
                            data
                                .map((record: any) => record[fieldName])
                                .filter((value) => value && value.toString().trim() !== "")
                        ),
                    ].sort((a, b) => {
                        // ترتيب أبجدي (يدعم العربية)
                        return a.toString().localeCompare(b.toString(), "ar");
                    });

                    setSuggestions(uniqueValues as string[]);

                    // حفظ في cache للاستخدام المستقبلي
                    localStorage.setItem(cacheKey, JSON.stringify(uniqueValues));
                }
            } catch (err) {
                console.error(`Exception fetching autocomplete for ${fieldName}:`, err);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, [fieldName]);

    return suggestions;
}

/**
 * Hook متخصص للحقول المتداخلة في JSONB (مثل recording_date.time_period)
 * 
 * @param jsonField - اسم العمود JSONB
 * @param nestedKey - المفتاح المتداخل
 * @returns مصفوفة من القيم المقترحة
 * 
 * @example
 * const timePeriodSuggestions = useNestedAutocomplete('recording_date', 'time_period');
 * // Returns: ['الخمسينيات', 'الستينيات', 'السبعينيات', ...]
 */
export function useNestedAutocomplete(
    jsonField: string,
    nestedKey: string
): string[] {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cacheKey = `autocomplete_${jsonField}_${nestedKey}`;

        // جلب من cache
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                setSuggestions(parsed);
                setLoading(false);
            } catch (e) {
                console.warn(`Failed to parse cached nested autocomplete`, e);
            }
        }

        const fetchSuggestions = async () => {
            try {
                const { data, error } = await supabase
                    .from("recordings")
                    .select(jsonField)
                    .not(jsonField, "is", null)
                    .limit(200);

                if (error) {
                    console.error(`Error fetching nested autocomplete:`, error);
                    setLoading(false);
                    return;
                }

                if (data && data.length > 0) {
                    // استخراج القيم من الحقل المتداخل
                    const uniqueValues = [
                        ...new Set(
                            data
                                .map((record: any) => {
                                    const jsonData = record[jsonField];
                                    return jsonData && typeof jsonData === "object"
                                        ? jsonData[nestedKey]
                                        : null;
                                })
                                .filter((value) => value && value.toString().trim() !== "")
                        ),
                    ].sort((a, b) => {
                        return a.toString().localeCompare(b.toString(), "ar");
                    });

                    setSuggestions(uniqueValues as string[]);
                    localStorage.setItem(cacheKey, JSON.stringify(uniqueValues));
                }
            } catch (err) {
                console.error(`Exception fetching nested autocomplete:`, err);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, [jsonField, nestedKey]);

    return suggestions;
}
