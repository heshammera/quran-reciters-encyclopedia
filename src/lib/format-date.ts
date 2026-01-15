/**
 * دالة مساعدة لتنسيق التاريخ من البيانات الجديدة
 * تدعم السنة فقط، السنة والشهر، أو التاريخ الكامل
 */
export function formatRecordingDate(
    year: number | null,
    month: number | null,
    day: number | null,
    time_period: string | null
): string {
    // إذا كان هناك فترة زمنية نصية وليس سنة
    if (time_period && !year) {
        return time_period;
    }

    // أسماء الأشهر بالعربية
    const monthNames = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];

    // إذا كان هناك تاريخ كامل
    if (year && month && day) {
        return `${day} ${monthNames[month - 1]} ${year}`;
    }

    // إذا كان هناك سنة وشهر فقط
    if (year && month) {
        return `${monthNames[month - 1]} ${year}`;
    }

    // إذا كان هناك سنة فقط
    if (year) {
        return year.toString();
    }

    // إذا كان هناك فترة زمنية
    if (time_period) {
        return time_period;
    }

    return 'غير محدد';
}
