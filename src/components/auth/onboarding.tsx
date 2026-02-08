"use client";

import React, { useState } from "react";
import { useProductivity } from "@/context/productivity-context";
import { Github, ArrowRight, Sparkles, ShieldCheck, Zap, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export const Onboarding = () => {
    const { setUserId, onboardGuest } = useProductivity();
    const [step, setStep] = useState<"landing" | "auth">("landing");
    const [pin, setPin] = useState(["", "", "", "", "", ""]);

    const pinRefs = [
        React.useRef<HTMLInputElement>(null),
        React.useRef<HTMLInputElement>(null),
        React.useRef<HTMLInputElement>(null),
        React.useRef<HTMLInputElement>(null),
        React.useRef<HTMLInputElement>(null),
        React.useRef<HTMLInputElement>(null),
    ];

    const handlePinChange = (index: number, value: string) => {
        if (value.length > 1) value = value[0];
        if (!/^\d*$/.test(value)) return;

        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);

        if (value && index < 5) {
            pinRefs[index + 1].current?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !pin[index] && index > 0) {
            pinRefs[index - 1].current?.focus();
        }
    };

    const handlePinSubmit = () => {
        const fullPin = pin.join("");
        if (fullPin.length === 6) {
            setUserId(`up_${fullPin}`);
        }
    };

    const copyExample = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Prompt copied! Paste it in the chat after setup.");
    };

    const setupExamples = [
        { label: "Next.js Dev", icon: "🌐", prompt: "setup my workspace as a nextjs developer" },
        { label: "Business Analyst", icon: "📊", prompt: "setup my workspace as a business analyst" },
        { label: "Project Manager", icon: "📅", prompt: "setup my workspace as a project manager" },
    ];

    const [isLoading, setIsLoading] = useState(false);

    const handleOnboard = async () => {
        setIsLoading(true);
        try {
            await onboardGuest();
        } finally {
            setIsLoading(false);
        }
    };

    const handleNext = () => {
        if (step === "landing") setStep("auth");
    };

    const handleBack = () => {
        if (step === "auth") setStep("landing");
    };

    const steps = [
        { id: "landing", label: "Intro" },
        { id: "auth", label: "Access" }
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative font-sans text-white bg-slate-950">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full bg-indigo-500/10" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full bg-purple-500/10" />
            </div>

            {/* Progress Navigation */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50">
                {steps.map((s, i) => (
                    <React.Fragment key={s.id}>
                        <div className={cn(
                            "w-2 h-2 rounded-full transition-all duration-500 shadow-lg",
                            step === s.id ? "bg-indigo-400 scale-125" : "bg-white/10"
                        )} />
                        {i < steps.length - 1 && <div className="w-8 h-[1px] bg-white/5" />}
                    </React.Fragment>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {step === "landing" && (
                    <motion.div
                        key="landing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="max-w-4xl w-full text-center space-y-12 z-10"
                    >
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300"
                            >
                                <Sparkles className="w-3 h-3 mr-2" />
                                Your Personal OS for Mastery
                            </motion.div>
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white">
                                Master your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">pursuit.</span>
                            </h1>
                            <p className="text-lg text-white/40 max-w-xl mx-auto font-medium">
                                TaskStack is the cognitive environment for artisans and high-performers. Track skills, optimize recovery, and build your digital library.
                            </p>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                            <button
                                onClick={handleOnboard}
                                disabled={isLoading}
                                className="bg-white text-slate-950 px-10 py-5 text-lg font-black rounded-[2rem] hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-2xl shadow-white/5 disabled:opacity-50"
                            >
                                {isLoading ? "Generating Workspace..." : "New Workspace"}
                                {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
                            </button>
                            <button
                                onClick={handleNext}
                                className="bg-white/5 border border-white/10 text-white/80 px-10 py-5 text-lg font-bold rounded-[2rem] hover:bg-white/10 transition-all active:scale-95"
                            >
                                Recover Session
                            </button>
                        </div>

                        {/* Prompt Examples */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-8">
                            {setupExamples.map((ex) => (
                                <button
                                    key={ex.label}
                                    onClick={() => copyExample(ex.prompt)}
                                    className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-left transition-all group"
                                >
                                    <span className="text-2xl mb-2 block">{ex.icon}</span>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 group-hover:text-white/60 transition-colors">{ex.label}</h3>
                                    <p className="text-[10px] text-white/20 mt-1 truncate italic">"{ex.prompt}"</p>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === "auth" && (
                    <motion.div
                        key="auth"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md w-full z-10"
                    >
                        <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[3rem] backdrop-blur-3xl space-y-8">
                            <div className="text-center space-y-2">
                                <ShieldCheck className="w-10 h-10 text-indigo-400 mx-auto" />
                                <h2 className="text-4xl font-black tracking-tighter">
                                    Access PIN.
                                </h2>
                                <p className="text-white/40 font-medium italic">Enter your 6-digit workspace PIN to continue.</p>
                            </div>

                            <div className="flex justify-between gap-2 px-2">
                                {pin.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={pinRefs[i]}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handlePinChange(i, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(i, e)}
                                        className="w-12 h-16 bg-white/5 border border-white/10 rounded-xl text-center text-2xl font-black focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handlePinSubmit}
                                disabled={pin.join("").length < 6}
                                className="w-full bg-white text-slate-950 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30"
                            >
                                Enter Workspace
                            </button>

                            <button
                                onClick={handleBack}
                                className="w-full text-white/20 hover:text-white/40 py-2 text-[10px] font-extrabold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                            >
                                <ChevronLeft className="w-3 h-3" />
                                Go Back
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
