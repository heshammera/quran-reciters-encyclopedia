export default function Loading() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3"></div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                ))}
            </div>

            {/* Content Skeleton */}
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        </div>
    );
}
