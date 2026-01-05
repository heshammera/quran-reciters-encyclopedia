import { createGroq } from '@ai-sdk/groq';
import { streamText, generateText, tool } from 'ai';
import { z } from 'zod';
import { supabase } from "@/lib/supabase/client";
import { getSurahName } from "@/lib/quran-helpers";


type CoreMessage = any;

import {
    searchAyahSnippet,
    findTracksByAyah,
    getReciterInfoTool,
    getRecordingsTool,
    getFeaturedRecordingsTool,
    sitePagesSearch,
    surahSearch
} from "@/app/actions/assistant-tools";

const LOGIC_PROMPT = `أنت العقل المدبر لـ "موسوعة قرّاء القرآن". مهمتك الوحيدة هي تحديد أي أداة يجب استخدامها.

⚠️ تحذير حاسم: أنت لا تملك أي معلومات على الإطلاق. يجب عليك استخدام الأدوات للحصول على البيانات.

الأدوات المتاحة:
1. البحث العام: {"type": "search", "query": "نص البحث"} - لأسماء القراء أو الأقسام.
2. البحث عن السور: {"type": "surah", "query": "اسم السورة"} - للبحث عن تسجيلات سورة معينة.
3. البحث بالآية: {"type": "ayah", "snippet": "نص الآية", "reciter": "اسم القارئ (اختياري)"} - للبحث عن آية محددة.
4. تلاوات القارئ: {"type": "recitations", "id": "UUID"} - لجلب التسجيلات عندما تعرف UUID القارئ.
5. مقترحات: {"type": "featured"} - لجلب تلاوات مختارة.
6. معلومات القارئ: {"type": "info", "id": "UUID"} - لتفاصيل القارئ (يحتاج UUID).

قواعد إلزامية:
- إذا كانت الرسالة الأخيرة للمستخدم تحية بسيطة (مثل: السلام عليكم، مرحباً، كيف حالك، شكراً)، لا تستخدم أي أداة. فقط رد بنص عربي بسيط.
- إذا سأل عن "معلومات أكثر" أو "من هو" أو "عنه" بدون ذكر اسم، انظر للرسائل السابقة لمعرفة القارئ المقصود ثم ابحث عنه مرة أخرى.
- عند السؤال عن آية أو جزء من آية (مثل "ومثل كلمة طيبة" أو "إن الله مع الصابرين")، استخدم أداة البحث بالآية (ayah).
- عند السؤال عن قارئ (مثل "المنشاوي" أو "البنا")، استخدم: {"type": "search", "query": "الاسم"}
- رد بالـ JSON فقط في سطر واحد عند استخدام أداة.
- ممنوع منعاً باتاً استخدام أي معلومات من خارج الأدوات.`;


const TEXT_PROMPT = `أنت مساعد "موسوعة قرّاء القرآن". وظيفتك هي مساعدة المستخدم بلطف.

قواعد الرد:
1. **للتحيات والمحادثات العادية** (مثل: كيف حالك، شكراً، مع السلامة):
   - رد بشكل طبيعي ودود كمساعد ذكي.
   - مثال: "كيف حالك؟" → "بخير الحمد لله! كيف يمكنني مساعدتك اليوم؟"

2. **للأسئلة الواقعية والبحث** (مثل: متى ولد المنشاوي، تلاوات البنا):
   - ⚠️ يمكنك فقط عرض ما يرد في الرسالة الأخيرة من بيانات.
   - إذا كانت البيانات فارغة أو لا تحتوي على الإجابة، قل: "نعتذر، لا توجد معلومات عن هذا في موسوعتنا حالياً."
   - ممنوع منعاً باتاً استخدام أي معلومات من الإنترنت أو معرفتك العامة.

3. **تنسيقات خاصة**:
   - للتلاوات: [{surahName}](play:{playUrl})
   - للمعلومات: اعرض ما هو موجود في البيانات فقط.

4. ممنوع الرد بـ JSON.`;

// Helper function to format dates in Arabic
function formatArabicDate(isoDate: string | null): string {
    if (!isoDate) return 'غير متوفر في الموسوعة';

    try {
        const date = new Date(isoDate);
        const day = date.getDate();
        const monthNames = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();

        return `${day} ${month} ${year}`;
    } catch (e) {
        return isoDate; // Return as-is if parsing fails
    }
}

// Helper to parse and clean message history to prevent "sticky" search results
function parseMessages(messages: any[]): CoreMessage[] {
    return messages.map((m, index) => {
        // Safe defaults
        const content = m.content || "";

        // Clean JSON and technical artifacts from history
        const cleanedContent = content
            .replace(/\{"type":\s*"(search|info|surah|recitations|featured|all_reciters)"[^}]+\}/g, '') // Remove assistant JSON actions
            .replace(/(معلومات القارئ|التلاوات|نتائج البحث عن)[^]*?(\[|\{)[^]*?(\]|\})/g, '[بيانات سابقة]') // Collapse old tool results in user/system messages
            .trim();

        // If it's a user message but we collapsed it to just "[بيانات سابقة]", 
        // and it's NOT the last message, we can almost ignore it or keep it minimal.
        // However, we must keep the actual user queries untouched.

        // Strategy: Only clean the content if it looks like an injected follow-up message
        const isInjectedFollowUp = (m.role === 'user' || m.role === 'system') &&
            (content.includes('JSON.stringify') || content.includes('playURL') || content.includes('play:'));

        if (isInjectedFollowUp && index < messages.length - 1) {
            return { role: m.role, content: "[نتائج بحث سابقة تمت أرشفتها]" };
        }

        return { role: m.role, content: cleanedContent };
    });
}

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // 1. Load Groq API key
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return new Response("Missing GROQ_API_KEY", { status: 500 });
        }

        const groq = createGroq({ apiKey });
        const parsedMessages = parseMessages(messages);

        // 1. Logic Turn: Determine if we need a tool
        const { text: logicOutput } = await generateText({
            model: groq("llama-3.3-70b-versatile"),
            system: LOGIC_PROMPT,
            messages: parsedMessages,
        });

        console.log(`>>> [Logic] Output: "${logicOutput}"`);

        // 2. Parse manual JSON actions
        let action: { type: string, query?: string, id?: string, snippet?: string, reciter?: string } | null = null;
        const jsonMatch = logicOutput.match(/\{"type":\s*"(search|info|surah|recitations|featured|all_reciters|ayah)"[^}]+\}/);
        if (jsonMatch) {
            try {
                action = JSON.parse(jsonMatch[0]);
            } catch (e) {
                console.error(">>> [DEBUG] Failed to parse JSON action:", e);
            }
        }

        // 3. If no tool action needed, just stream the text response
        if (!action) {
            const result = await streamText({
                model: groq("llama-3.3-70b-versatile"),
                system: TEXT_PROMPT,
                messages: parsedMessages,
            });
            return result.toTextStreamResponse();
        }

        // 4. Execute tool manually
        let toolResult: any = null;
        let followUpInstruction = "";

        if (action.type === 'search' && action.query) {
            console.log(`>>> [Action] Searching for: ${action.query}`);
            const searchRes = await sitePagesSearch(action.query);

            // Optimization: If exactly one reciter found, fetch their recordings immediately
            if (searchRes.reciters.length === 1) {
                const reciter = searchRes.reciters[0];
                const recordings = await getRecordingsTool(reciter.id);
                toolResult = { reciter, recordings };

                // Check if data has the information requested
                const hasBirthDate = reciter.birth_date && reciter.birth_date !== null;
                const hasDeathDate = reciter.death_date && reciter.death_date !== null;

                // Format dates in Arabic
                const birthDateFormatted = formatArabicDate(reciter.birth_date);
                const deathDateFormatted = formatArabicDate(reciter.death_date);

                // Get the last user message to understand context
                const lastUserMessage = parsedMessages[parsedMessages.length - 1]?.content || '';

                followUpInstruction = `معلومات القارئ من قاعدة البيانات فقط:
الاسم: ${reciter.name_ar}
تاريخ الميلاد: ${birthDateFormatted}
تاريخ الوفاة: ${deathDateFormatted}
السيرة الذاتية: ${reciter.biography_ar || 'غير متوفرة في الموسوعة'}
التلاوات المتوفرة: ${recordings.length} تلاوة

سؤال المستخدم: "${lastUserMessage}"

تعليمات صارمة:
1. اقرأ سؤال المستخدم بدقة.
2. إذا سأل فقط عن تاريخ الميلاد أو الوفاة، أجب بهذه المعلومة فقط - لا تعرض التلاوات.
3. إذا سأل عن التلاوات أو طلب الاستماع، اعرض التلاوات بهذا التنسيق: [{surahName}](play:{playUrl})
4. إذا كانت المعلومة "غير متوفر"، قل ذلك بوضوح.
5. ممنوع استخدام أي معلومات من خارج هذه البيانات.

بيانات التلاوات (استخدمها فقط إذا طلب المستخدم التلاوات): ${JSON.stringify(recordings)}`;
            } else if (searchRes.reciters.length === 0) {
                // No reciters found
                toolResult = searchRes;
                followUpInstruction = `لا يوجد أي قارئ باسم "${action.query}" في قاعدة بيانات الموسوعة.

قل للمستخدم: "نعتذر، لا يوجد قارئ باسم '${action.query}' في موسوعتنا حالياً."`;
            } else {
                toolResult = searchRes;
                followUpInstruction = `نتائج البحث عن "${action.query}": ${JSON.stringify(toolResult)}. اعرض النتائج بروابطها الداخلية (حقل url).`;
            }
        } else if (action.type === 'ayah' && action.snippet) {
            console.log(`>>> [Action] Ayah search for: ${action.snippet} (Reciter: ${action.reciter || 'any'})`);

            // 1. Search for the ayah
            const ayahResults = await searchAyahSnippet(action.snippet);

            if (!ayahResults || ayahResults.length === 0) {
                toolResult = { ayah: null, recordings: [] };
                followUpInstruction = `نعتذر، لم نجد الآية "${action.snippet}" في المصحف الشريف داخل قاعدة بياناتنا. تأكد من صحة النص.`;
            } else {
                const bestAyah = ayahResults[0];
                let reciterId = undefined;

                // 2. Search for the reciter if provided
                if (action.reciter) {
                    const reciterRes = await sitePagesSearch(action.reciter);
                    if (reciterRes.reciters.length > 0) {
                        reciterId = reciterRes.reciters[0].id;
                    }
                }

                // 3. Find tracks covering this ayah
                const recordings = await findTracksByAyah(bestAyah.surah_number, bestAyah.ayah_number, { reciterId });

                toolResult = { ayah: bestAyah, recordings };
                const surahName = getSurahName(bestAyah.surah_number);

                followUpInstruction = `بيانات الآية: سورة ${surahName}، آية ${bestAyah.ayah_number}.
التلاوات التي تغطي هذه الآية: ${JSON.stringify(recordings)}.

تعليمات:
1. أخبر المستخدم بمكان الآية (اسم السورة ورقم الآية).
2. اعرض التلاوات المتاحة بهذا التنسيق: [▶ تشغيل سورة {surahName} للمنساوي](play:{playUrl})
3. إذا لم تجد تلاوات لهذا القارئ بالتحديد، قل ذلك واعرض تلاوات قراء آخرين لنفس الآية إن وجدت.`;
            }
        } else if (action.type === 'surah' && action.query) {
            console.log(`>>> [Action] Surah search for: ${action.query}`);
            toolResult = await surahSearch(action.query);
            followUpInstruction = `تسجيلات سورة "${action.query}": ${JSON.stringify(toolResult)}.

استخدم التنسيق: [▶ تشغيل {surahName}](play:{playUrl})`;
        } else if (action.type === 'recitations' && action.id) {
            console.log(`>>> [Action] Fetching recitations for ID: ${action.id}`);
            toolResult = await getRecordingsTool(action.id);
            followUpInstruction = `هذه قائمة بتلاوات القارئ: ${JSON.stringify(toolResult)}.

استخدم التنسيق: [▶ تشغيل {surahName}](play:{playUrl})`;
        } else if (action.type === 'featured') {
            console.log(`>>> [Action] Fetching featured/latest`);
            toolResult = await getFeaturedRecordingsTool();
            followUpInstruction = `هذه تلاوات مقترحة: ${JSON.stringify(toolResult)}.

استخدم التنسيق: [▶ تشغيل {surahName}](play:{playUrl})`;
        } else if (action.type === 'all_reciters') {
            console.log(`>>> [Action] Fetching all reciters`);
            const { data } = await supabase.from("reciters").select("id, name_ar").order("name_ar");
            toolResult = data;
            followUpInstruction = `هذه قائمة ببعض القراء المتاحين في الموقع: ${JSON.stringify(data)}. ابحث عن الاسم الذي طلبه المستخدم واعرض تلاواته (recitations) إذا وجدت تطابقاً.`;
        } else if (action.type === 'info' && action.id) {
            console.log(`>>> [Action] Fetching info for ID: ${action.id}`);
            toolResult = await getReciterInfoTool(action.id);
            followUpInstruction = `معلومات القارئ: ${JSON.stringify(toolResult)}. اعرض السيرة الذاتية وعدد المجموعات الصوتية.`;
        }

        // 5. Final Turn: Stream results to user
        const finalMessages = [
            ...parsedMessages,
            { role: 'user', content: followUpInstruction }
        ];

        // Persistent log for the agent to read
        const debugInfo = `
=== DEBUG LOG ===
Time: ${new Date().toISOString()}
Action: ${JSON.stringify(action)}
Instruction: ${followUpInstruction}
Final Messages Count: ${finalMessages.length}
=================
`;
        console.log(debugInfo);

        console.log(">>> [Final] Messages to Turn 2:", JSON.stringify(finalMessages, null, 2));
        console.log(">>> [Final] Streaming response...");
        const result = await streamText({
            model: groq("llama-3.3-70b-versatile"),
            system: TEXT_PROMPT,
            messages: finalMessages as any,
        });

        return result.toTextStreamResponse();

    } catch (e: any) {
        console.error("Assistant Error:", e);
        return new Response(e.message, { status: 500 });
    }
}
