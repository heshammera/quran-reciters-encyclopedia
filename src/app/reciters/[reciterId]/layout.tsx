import { notFound } from "next/navigation";
import { getReciter, getSections, getReciterSectionStats } from "@/lib/supabase/queries";
import ReciterSidebar from "@/components/reciters/ReciterSidebar";

interface ReciterLayoutProps {
    children: React.ReactNode;
    params: Promise<{
        reciterId: string;
    }>;
}

export default async function ReciterLayout({ children, params }: ReciterLayoutProps) {
    const { reciterId } = await params;

    const reciter = await getReciter(reciterId);

    if (!reciter) {
        notFound();
    }

    // Fetch stats for the sidebar
    // We fetch sections to count them, and statsMap for total recordings
    const [sectionsData, statsMap] = await Promise.all([
        getSections(),
        getReciterSectionStats(reciter.id)
    ]);

    // Calculate valid sections (count > 0)
    const validSectionsCount = sectionsData.filter(section => (statsMap.get(section.id) || 0) > 0).length;

    // Calculate total recordings
    const totalRecordings = Array.from(statsMap.values()).reduce((a, b) => a + b, 0);

    return (
        // Layout: Sidebar (Fixed/Sticky) + Content (Scrollable)
        <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen lg:overflow-hidden bg-white dark:bg-[#020617] text-slate-900 dark:text-white font-sans transition-colors duration-300" dir="rtl">

            {/* Left Panel: Persistent Sidebar */}
            <ReciterSidebar
                reciter={reciter}
                stats={{
                    sectionsCount: validSectionsCount,
                    recordingsCount: totalRecordings,
                    reciterCountry: 'مصر' // database field not yet ready
                }}
            />

            {/* Right Panel: Dynamic Content (Page) */}
            <main className="flex-1 w-full lg:w-auto lg:overflow-y-auto bg-slate-50 dark:bg-gradient-to-b dark:from-[#0f172a] dark:to-[#020617] lg:bg-gradient-to-b lg:from-white lg:to-slate-100 relative">
                {children}
            </main>
        </div>
    );
}
