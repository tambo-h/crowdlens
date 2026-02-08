"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Moon, Coffee, Sparkles } from "lucide-react";
import { theme } from "@/lib/theme";

export function RecoveryTools() {
    type PhaseType = "inhale" | "hold" | "exhale" | "rest";
    const [phase, setPhase] = useState<PhaseType>("inhale");
    const [seconds, setSeconds] = useState(4);

    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds((prev) => {
                if (prev <= 1) {
                    setPhase((current) => {
                        switch (current) {
                            case "inhale": return "hold";
                            case "hold": return "exhale";
                            case "exhale": return "rest";
                            case "rest": return "inhale";
                        }
                    });
                    return 4;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const phases: Record<PhaseType, { text: string; color: string }> = {
        inhale: { text: "Breathe In", color: "#6366f1" },
        hold: { text: "Hold", color: "#4f46e5" },
        exhale: { text: "Breathe Out", color: "#818cf8" },
        rest: { text: "Rest", color: "#312e81" },
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-white/90">Recovery Mode Active</h2>
                <p className="text-white/40">Your energy is low. Let's focus on recharging instead of pushing.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Box Breathing */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center space-y-6 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-primary/80 mb-2">
                        <Wind className="w-5 h-5 text-indigo-400" />
                        <span className="text-sm font-medium uppercase tracking-widest text-indigo-400">Box Breathing</span>
                    </div>

                    <div className="relative w-48 h-48 flex items-center justify-center">
                        <motion.div
                            animate={{
                                scale: phase === "inhale" ? 1.2 : phase === "exhale" ? 0.8 : 1,
                                opacity: [0.3, 0.6, 0.3]
                            }}
                            transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                            className="absolute inset-0 rounded-full blur-3xl opacity-20"
                            style={{ backgroundColor: phases[phase].color }}
                        />
                        <div className="text-4xl font-bold z-10">{seconds}</div>
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle
                                cx="96"
                                cy="96"
                                r="80"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                className="text-white/5"
                            />
                            <motion.circle
                                cx="96"
                                cy="96"
                                r="80"
                                fill="none"
                                stroke={phases[phase].color}
                                strokeWidth="4"
                                strokeDasharray="502"
                                animate={{ strokeDashoffset: [502, 0] }}
                                transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                            />
                        </svg>
                    </div>
                    <div className="text-xl font-medium text-white/60">{phases[phase].text}</div>
                </div>

                {/* Soft Focus */}
                <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm space-y-4">
                        <div className="flex items-center gap-2 text-yellow-400/80">
                            <Coffee className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-wider">Mild Stimulus</span>
                        </div>
                        <p className="text-lg italic text-white/70">"Rest is not idleness, and to lie sometimes on the grass under trees... is by no means a waste of time."</p>
                        <span className="text-sm text-white/30">— John Lubbock</span>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 rounded-3xl p-6 flex items-center gap-4">
                        <div className="p-3 bg-white/5 rounded-2xl">
                            <Moon className="w-6 h-6 text-indigo-300" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-white/80">Suggested Habit</h4>
                            <p className="text-sm text-white/40">Read 5 pages of a physical book.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
