"use client";

import { useEffect, useRef } from "react";

interface WaveformVisualizerProps {
    analyser: AnalyserNode | null;
    isPlaying: boolean;
    color?: string; // Optional color string, e.g., "#10b981" (emerald-500)
}

export default function WaveformVisualizer({ analyser, isPlaying, color = "#10b981" }: WaveformVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Analyser config if available
        let bufferLength = 0;
        let dataArray: Uint8Array | null = null;

        if (analyser) {
            analyser.fftSize = 64;
            bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
        }

        let silenceCounter = 0;
        let useSimulation = false;

        const draw = () => {
            if (!isPlaying) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // Optional: Draw a flat line or dot to signify "ready"
                ctx.fillStyle = color;
                ctx.globalAlpha = 0.3;
                ctx.fillRect(0, canvas.height - 2, canvas.width, 2);
                ctx.globalAlpha = 1.0;
                return;
            }

            requestRef.current = requestAnimationFrame(draw);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Attempt to get real data
            let hasSignal = false;
            if (analyser && dataArray) {
                analyser.getByteFrequencyData(dataArray as any);
                // Check if we have any signal
                for (let i = 0; i < dataArray.length; i++) {
                    if (dataArray[i] > 0) {
                        hasSignal = true;
                        break;
                    }
                }
            }

            // Logic to switch to simulation if silence persists while playing (likely CORS blocking)
            if (!hasSignal) {
                silenceCounter++;
                if (silenceCounter > 10) { // ~160ms of silence
                    useSimulation = true;
                }
            } else {
                silenceCounter = 0;
                useSimulation = false;
            }

            const bars = 5;
            const barWidth = (canvas.width / bars) - 1;

            for (let i = 0; i < bars; i++) {
                let barHeight = 0;

                if (!useSimulation && dataArray) {
                    // Real Data
                    const step = Math.floor(dataArray.length / bars);
                    let sum = 0;
                    for (let j = 0; j < step; j++) {
                        sum += dataArray[(i * step) + j];
                    }
                    barHeight = ((sum / step) / 255) * canvas.height;
                } else {
                    // Simulation Mode (Fake it!)
                    // Use time-based sine waves + random noise for organic feel
                    const time = Date.now() / 150;
                    const noise = Math.random() * 0.3;
                    const wave = Math.sin(time + i) * 0.5 + 0.5; // 0 to 1
                    // Combine them
                    const value = (wave * 0.7) + noise;
                    barHeight = value * canvas.height * 0.8; // Max 80% height
                }

                // Ensure min height for visibility
                barHeight = Math.max(2, barHeight);

                ctx.fillStyle = color;
                const x = i * (barWidth + 1);
                const y = canvas.height - barHeight;

                ctx.fillRect(x, y, barWidth, barHeight);
            }
        };

        if (isPlaying) {
            draw();
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [analyser, isPlaying, color]);

    return (
        <canvas
            ref={canvasRef}
            width={40}
            height={40}
            className="w-full h-full opacity-50"
        />
    );
}
