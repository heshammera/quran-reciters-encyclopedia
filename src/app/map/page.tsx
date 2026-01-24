import InteractiveMap from "@/components/map/InteractiveMap";
import { getCityRecordingsStats } from "@/app/actions/map";

export const metadata = {
    title: 'خريطة التلاوات | موسوعة القراء',
    description: 'استكشف تلاوات القرآن الكريم عبر خريطة العالم الإسلامي التفاعلية.',
};

export default async function MapPage() {
    const stats = await getCityRecordingsStats();

    return (
        <div className="flex flex-col h-[calc(100vh-64px)]">
            <InteractiveMap stats={stats} />
        </div>
    );
}
