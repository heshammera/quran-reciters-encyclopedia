'use client';

import { motion } from "framer-motion";

export default function SiriWaveVisualizer() {
    return (
        <div className="relative w-full h-full flex items-center justify-center bg-black rounded-full overflow-hidden">
            {/* Core Center - Stable */}
            <motion.div
                className="absolute w-2 h-2 bg-white rounded-full z-10 shadow-[0_0_10px_white]"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
            />

            {/* Cyan Wave */}
            <motion.div
                className="absolute w-full h-full border-2 border-cyan-400 rounded-[40%] opacity-80"
                animate={{
                    rotate: 360,
                    scale: [0.8, 1.2, 0.8],
                    borderRadius: ["40%", "50%", "40%"]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                style={{ filter: "drop-shadow(0 0 5px cyan)" }}
            />

            {/* Purple Wave */}
            <motion.div
                className="absolute w-full h-full border-2 border-purple-500 rounded-[45%] opacity-80"
                animate={{
                    rotate: -360,
                    scale: [1.1, 0.9, 1.1],
                    borderRadius: ["45%", "35%", "45%"]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                style={{ filter: "drop-shadow(0 0 5px purple)" }}
            />

            {/* Emerald Wave */}
            <motion.div
                className="absolute w-full h-full border-2 border-emerald-400 rounded-[38%] opacity-80"
                animate={{
                    rotate: 180,
                    scale: [0.9, 1.3, 0.9],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: "drop-shadow(0 0 5px emerald)" }}
            />

            {/* Dynamic Filled Blob (The "Soul") */}
            <motion.div
                className="absolute w-1/2 h-1/2 bg-gradient-to-tr from-cyan-500 to-purple-500 rounded-full blur-md opacity-50"
                animate={{
                    scale: [1, 1.5, 1],
                    rotate: [0, 180, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
            />
        </div>
    );
}
