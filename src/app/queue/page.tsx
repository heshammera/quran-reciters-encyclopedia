import DraggableQueue from "@/components/queue/DraggableQueue";
import QueueHeader from "@/components/queue/QueueHeader";

export default function QueuePage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-32">
            <QueueHeader />

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <DraggableQueue />
                </div>
            </div>
        </div>
    );
}
