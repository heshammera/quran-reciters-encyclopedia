'use client';

export default function RadioVisualizer({ isPlaying }: { isPlaying: boolean }) {
    return (
        <div className="flex items-end justify-center gap-1 h-16 w-full max-w-[200px] mx-auto overflow-hidden">
            {[...Array(8)].map((_, i) => (
                <div
                    key={i}
                    className={`w-3 bg-emerald-500 rounded-t-sm transition-all duration-300 ${isPlaying ? 'animate-music-bar' : 'h-1 opacity-20'}`}
                    style={{
                        animationDelay: `${i * 0.1}s`,
                        height: isPlaying ? undefined : '4px',
                    }}
                ></div>
            ))}
            <style jsx>{`
            @keyframes music-bar {
                0%, 100% { height: 15%; opacity: 0.5; }
                50% { height: 80%; opacity: 1; }
            }
            .animate-music-bar {
                animation: music-bar 0.8s ease-in-out infinite alternate;
            }
        `}</style>
        </div>
    );
}
