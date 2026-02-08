"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Moon, Coffee, Sparkles } from "lucide-react";
import { theme } from "@/lib/theme";
import { useProductivity } from "@/context/productivity-context";

export function RecoveryTools() {
    type PhaseType = "inhale" | "hold" | "exhale" | "rest";
    const [phase, setPhase] = useState<PhaseType>("inhale");
    const [seconds, setSeconds] = useState(4);
    const { logEnergyLevel, triggerCreativeRefresh } = useProductivity();

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

    const phases: Record<PhaseType, { text: string; color: string; sub: string }> = {
        inhale: { text: "Deep Inhale", color: "#818cf8", sub: "Expand your lungs" },
        hold: { text: "Retain", color: "#6366f1", sub: "Feel the calm" },
        exhale: { text: "Slow Release", color: "#c084fc", sub: "Let go of tension" },
        rest: { text: "Pause", color: "#4f46e5", sub: "Reset your focus" },
    };

    return (
        <div className="relative min-h-[80vh] flex flex-col items-center justify-center p-8 overflow-hidden rounded-3xl bg-slate-950 border border-white/5">
            {/* Mesh Gradient Background */}
            <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px] animate-pulse duration-[5s]" />
            </div>

            <div className="relative z-10 w-full max-w-4xl space-y-12">
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em]"
                    >
                        <Sparkles className="w-3 h-3" />
                        Recovery Protocol Active
                    </motion.div>
                    <h2 className="text-5xl font-extrabold tracking-tighter text-white">Time to Recharge.</h2>
                    <p className="text-lg text-white/40 max-w-xl mx-auto font-medium">
                        Your nervous system needs a reset. Focus on the breath and silence the noise.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                    {/* Breath Guide */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center justify-center space-y-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-20">
                            <Wind className="w-12 h-12 text-indigo-400" />
                        </div>

                        <div className="relative w-56 h-56 flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={phase}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{
                                        scale: phase === "inhale" ? 1.3 : phase === "exhale" ? 0.9 : 1.1,
                                        opacity: 1
                                    }}
                                    exit={{ scale: 1.5, opacity: 0 }}
                                    transition={{ duration: 4, ease: "linear" }}
                                    className="absolute inset-0 rounded-full blur-[60px]"
                                    style={{ backgroundColor: phases[phase].color, opacity: 0.15 }}
                                />
                            </AnimatePresence>

                            <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                                <circle cx="112" cy="112" r="90" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/5" />
                                <motion.circle
                                    cx="112"
                                    cy="112"
                                    r="90"
                                    fill="none"
                                    stroke={phases[phase].color}
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    strokeDasharray="565"
                                    animate={{ strokeDashoffset: [565, 0] }}
                                    transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                                />
                            </svg>

                            <div className="flex flex-col items-center z-10">
                                <span className="text-6xl font-black text-white">{seconds}</span>
                                <span className="text-xs font-bold text-white/30 uppercase tracking-widest mt-1">Seconds</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <motion.div
                                key={phase}
                                initial={{ y: 5, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-3xl font-bold text-white mb-1"
                            >
                                {phases[phase].text}
                            </motion.div>
                            <div className="text-sm font-medium text-white/40">{phases[phase].sub}</div>
                        </div>
                    </div>

                    {/* Meta Support */}
                    <div className="flex flex-col gap-6">
                        <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl flex flex-col justify-center gap-6 relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="space-y-4 relative">
                                <div className="p-3 bg-white/5 w-fit rounded-2xl border border-white/10 shadow-inner">
                                    <Coffee className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-white/80">Mild Restoration</h4>
                                    <p className="text-sm text-white/40 leading-relaxed">
                                        Avoid high-dopamine inputs. Step away from the screen for 5 minutes after this session.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 text-sm italic text-white/30 leading-relaxed relative">
                                "Efficiency is doing things right; effectiveness is doing the right things. Right now, the right thing is nothing."
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-[2.5rem] p-8 backdrop-blur-xl relative overflow-hidden group">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="p-3 bg-indigo-500/20 rounded-2xl">
                                    <Moon className="w-6 h-6 text-indigo-300" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white/90">Quick Reset Task</h4>
                                    <p className="text-xs text-indigo-300/60 font-medium">Hydrate and reset your visual focus.</p>
                                </div>
                            </div>

                            <button
                                onClick={async () => {
                                    await logEnergyLevel({ level: 4, notes: "Feeling better after recovery mode." });
                                    triggerCreativeRefresh();
                                }}
                                className="w-full py-4 rounded-2xl bg-white text-slate-950 font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-xl shadow-indigo-500/10"
                            >
                                I'm Ready to Resume
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
