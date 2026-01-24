'use client';

import { motion } from "framer-motion";

export default function SiriWaveVisualizer() {
    return (
        <div className="relative w-full h-full flex items-center justify-center bg-gray-900 rounded-full overflow-hidden">

            {/* Cyan Wave - Thick & Vivid */}
            <motion.div
                className="absolute w-full h-full border-4 border-cyan-500 rounded-[40%]"
                animate={{
                    rotate: 360,
                    scale: [0.8, 1.1, 0.8],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                style={{ boxShadow: "0 0 10px #06b6d4" }}
            />

            {/* Purple Wave - Thick & Vivid */}
            <motion.div
                className="absolute w-full h-full border-4 border-purple-600 rounded-[45%]"
                animate={{
                    rotate: -360,
                    scale: [1.0, 0.9, 1.0],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                style={{ boxShadow: "0 0 10px #9333ea" }}
            />

            {/* Emerald Wave - Thick & Vivid */}
            <motion.div
                className="absolute w-full h-full border-4 border-emerald-500 rounded-[38%]"
                animate={{
                    rotate: 180,
                    scale: [0.9, 1.2, 0.9],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                style={{ boxShadow: "0 0 10px #10b981" }}
            />

            {/* Central Pulse (Colored, not white) */}
            <motion.div
                className="absolute w-3 h-3 bg-rose-500 rounded-full z-20"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{ boxShadow: "0 0 10px #f43f5e" }}
            />
        </div>
    );
}
