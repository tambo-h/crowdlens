"use client";

import React, { useState } from "react";
import { useProductivity } from "@/context/productivity-context";
import { Github, ArrowRight, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export const Onboarding = () => {
    const { setUserId, onboardGuest } = useProductivity();
    const [step, setStep] = useState<"landing" | "info" | "auth">("landing");
    const [mode, setMode] = useState<"login" | "register">("register");
    const [formData, setFormData] = useState({
        name: "",
        gender: "",
        email: ""
    });

    const handleSocialLogin = (provider: string) => {
        const mockId = `${provider}_${Math.random().toString(36).substring(2, 11)}`;
        setUserId(mockId);
    };

    const handleEmailAuth = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email) return;
        const mockId = `user_${formData.email.split("@")[0]}_${Math.random().toString(36).substring(2, 5)}`;
        setUserId(mockId);
    };

    const handleNext = () => {
        if (step === "landing") setStep("info");
        else if (step === "info") setStep("auth");
    };

    const handleBack = () => {
        if (step === "auth") setStep("info");
        else if (step === "info") setStep("landing");
    };

    const steps = [
        { id: "landing", label: "Intro" },
        { id: "info", label: "Personalize" },
        { id: "auth", label: "Access" }
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative font-sans text-white bg-slate-950">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full bg-indigo-500/10" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full bg-purple-500/10" />
            </div>

            {/* Progress Navigation (Req 9) */}
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
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">craft.</span>
                            </h1>
                            <p className="text-lg text-white/40 max-w-xl mx-auto font-medium">
                                TaskStack is the cognitive environment for modern specialists. Track skills, optimize recovery, and build your digital library.
                            </p>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                            <button
                                onClick={handleNext}
                                className="bg-white text-slate-950 px-10 py-5 text-lg font-black rounded-[2rem] hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-2xl shadow-white/5"
                            >
                                Build Your Space
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </button>
                            <button
                                onClick={onboardGuest}
                                className="bg-white/5 border border-white/10 text-white/80 px-10 py-5 text-lg font-bold rounded-[2rem] hover:bg-white/10 transition-all active:scale-95"
                            >
                                Try as Guest
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === "info" && (
                    <motion.div
                        key="info"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="max-w-md w-full z-10 space-y-8"
                    >
                        <div className="text-center space-y-2">
                            <Zap className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
                            <h2 className="text-4xl font-black tracking-tighter">Personalize.</h2>
                            <p className="text-white/40 font-medium italic">We tailor your experience based on your identity.</p>
                        </div>

                        <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-3xl space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Display Name</label>
                                    <input
                                        type="text"
                                        placeholder="Alex"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold placeholder:text-white/10"
                                    />
                                </div>

                                {/* Gender Selection (Req 10) */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Greeting Preference</label>
                                    <div className="flex gap-2">
                                        {["Masculine", "Feminine", "Neutral"].map((g) => (
                                            <button
                                                key={g}
                                                onClick={() => setFormData({ ...formData, gender: g })}
                                                className={cn(
                                                    "flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                                                    formData.gender === g
                                                        ? "bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20"
                                                        : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                                                )}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleNext}
                                disabled={!formData.name || !formData.gender}
                                className="w-full bg-white text-slate-950 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                            >
                                Continue to Access
                            </button>

                            <button
                                onClick={handleBack}
                                className="w-full text-white/20 hover:text-white/40 py-2 text-[10px] font-extrabold uppercase tracking-widest transition-colors"
                            >
                                ← Go Back
                            </button>
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
                                    Final Path.
                                </h2>
                                <p className="text-white/40 font-medium italic">Secure your workspace to sync across devices.</p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => handleSocialLogin("github")}
                                    className="w-full bg-white text-slate-950 hover:bg-white/90 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
                                >
                                    <Github className="w-5 h-5" />
                                    Account with GitHub
                                </button>
                                <button
                                    onClick={() => handleSocialLogin("google")}
                                    className="w-full bg-white/5 border border-white/10 hover:bg-white/10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Account with Google
                                </button>
                            </div>

                            <form onSubmit={handleEmailAuth} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Magic Link Email</label>
                                    <input
                                        type="email"
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold placeholder:text-white/10"
                                    />
                                </div>
                                <button type="submit" className="w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-500/20">
                                    Complete Setup
                                </button>
                            </form>

                            <button
                                onClick={handleBack}
                                className="w-full text-white/20 hover:text-white/40 py-2 text-[10px] font-extrabold uppercase tracking-widest transition-colors"
                            >
                                ← Go Back
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
