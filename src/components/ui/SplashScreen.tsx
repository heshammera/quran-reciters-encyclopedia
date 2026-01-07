import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";

const ADHKAR = [
    "سبحان الله وبحمده، سبحان الله العظيم",
    "لا حول ولا قوة إلا بالله",
    "اللهم صل وسلم على نبينا محمد",
    "أستغفر الله العظيم وأتوب إليه",
    "سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر",
    "لا إله إلا أنت سبحانك إني كنت من الظالمين",
    "رضيت بالله رباً، وبالإسلام ديناً، وبمحمد نبياً",
    "يا حي يا قيوم برحمتك أستغيث"
];

export default function SplashScreen() {
    const [isVisible, setIsVisible] = useState(false); // Default false, effect will turn it on
    const [adhkarIndex, setAdhkarIndex] = useState(0);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Trigger on mount and navigation
        setIsVisible(true);
        setAdhkarIndex((prev) => (prev + 1) % ADHKAR.length); // Rotate adhkar on new load

        // Cycle through Adhkar while visible
        const interval = setInterval(() => {
            setAdhkarIndex((prev) => (prev + 1) % ADHKAR.length);
        }, 3000);

        // Hide after duration
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 3500); // 3.5 seconds to read at least one dhikr

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [pathname, searchParams]);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center text-center p-4"
                >
                    {/* Premium Animated Logo Container */}
                    <div className="relative mb-12 flex items-center justify-center">

                        {/* 1. Deep Glow (Background) - Intensified */}
                        <div className="absolute inset-0 bg-emerald-500/50 blur-[60px] rounded-full animate-pulse"></div>

                        {/* 2. Rotating Outer Ring - Thicker & Brighter */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute w-52 h-52 rounded-full border-2 border-dashed border-emerald-400/60 dark:border-emerald-300/40"
                        />

                        {/* 3. Counter-Rotating Inner Ring (Gold Accent) - Thicker & Brighter */}
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute w-44 h-44 rounded-full border-2 border-dotted border-amber-400/60 dark:border-amber-300/50"
                        />

                        {/* 4. Ripple Effects - More Visible */}
                        <motion.div
                            animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                            className="absolute inset-0 bg-emerald-400/20 rounded-full z-0"
                        />

                        {/* 5. Main Logo Circle - Intense Glow */}
                        <motion.div
                            animate={{
                                scale: [1, 1.05, 1],
                                boxShadow: [
                                    "0 0 30px rgba(16, 185, 129, 0.4)",
                                    "0 0 60px rgba(16, 185, 129, 0.6)",
                                    "0 0 30px rgba(16, 185, 129, 0.4)"
                                ]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="relative z-10 w-32 h-32 md:w-40 md:h-40 bg-white rounded-full overflow-hidden flex items-center justify-center border-4 border-emerald-100 shadow-2xl"
                        >
                            <img
                                src="/logo.png"
                                alt="موسوعة القراء"
                                className="w-full h-full object-contain p-3"
                            />
                        </motion.div>
                    </div>

                    {/* Rotating Adhkar */}
                    <div className="h-24 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={adhkarIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.5 }}
                                className="text-emerald-400/90 text-xl md:text-2xl font-medium font-serif leading-relaxed px-4"
                            >
                                {ADHKAR[adhkarIndex]}
                            </motion.p>
                        </AnimatePresence>
                    </div>

                    {/* Loading Bar */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "200px" }}
                        transition={{ duration: 4.5, ease: "linear" }}
                        className="absolute bottom-10 h-1 bg-gradient-to-r from-emerald-900 via-emerald-500 to-emerald-900 rounded-full opacity-50"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
