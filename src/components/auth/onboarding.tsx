"use client";

import React, { useState } from "react";
import { useProductivity } from "@/context/productivity-context";
import { Github, ArrowRight, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { theme } from "@/lib/theme";

export const Onboarding = () => {
    const { setUserId, onboardGuest } = useProductivity();
    const [mode, setMode] = useState<"landing" | "login" | "register">("landing");
    const [email, setEmail] = useState("");

    const handleSocialLogin = (provider: string) => {
        const mockId = `${provider}_${Math.random().toString(36).substring(2, 11)}`;
        setUserId(mockId);
    };

    const handleEmailAuth = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        const mockId = `user_${email.split("@")[0]}_${Math.random().toString(36).substring(2, 5)}`;
        setUserId(mockId);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative font-sans" style={{ backgroundColor: theme.colors.backgroundDark.main, color: theme.colors.textDark.primary }}>
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full" style={{ backgroundColor: `${theme.colors.primary.blue}1a` }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full" style={{ backgroundColor: `${theme.colors.primary.blue}1a` }} />
            </div>

            <AnimatePresence mode="wait">
                {mode === "landing" && (
                    <motion.div
                        key="landing"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-4xl w-full text-center space-y-12 z-10"
                    >
                        <div className="space-y-4">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-400 mb-4"
                            >
                                <Sparkles className="w-3 h-3 mr-2" />
                                Next Generation Productivity OS
                            </motion.div>
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 leading-tight">
                                Focus on what <br /> matters most.
                            </h1>
                            <p className="text-lg text-white/40 max-w-2xl mx-auto" style={{ color: theme.colors.textDark.secondary }}>
                                TaskStack is an AI-powered workspace that helps you track habits, manage time, and optimize your creative energy.
                            </p>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => setMode("register")}
                                className="text-white px-8 py-4 text-lg font-semibold rounded-2xl group transition-all duration-300 flex items-center justify-center"
                                style={{ backgroundColor: theme.colors.primary.blue }}
                            >
                                Get Started
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={onboardGuest}
                                className="bg-white/5 border border-white/10 text-white px-8 py-4 text-lg font-semibold rounded-2xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center"
                            >
                                Continue as Guest
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 max-w-4xl mx-auto">
                            {[
                                { icon: Zap, title: "AI Driven", desc: "Automate your workflows with AI" },
                                { icon: ShieldCheck, title: "Persistent", desc: "Your data stays synced forever" },
                            ].map((feature, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl text-left hover:border-primary/30 transition-colors" style={{ borderColor: `${theme.colors.primary.blue}33` }}>
                                    <feature.icon className="w-8 h-8 mb-4" style={{ color: theme.colors.primary.blue }} />
                                    <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                                    <p className="text-sm text-white/40" style={{ color: theme.colors.textDark.muted }}>{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {(mode === "login" || mode === "register") && (
                    <motion.div
                        key="auth"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="max-w-md w-full z-10"
                    >
                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl space-y-8">
                            <div className="text-center space-y-2">
                                <h2 className="text-3xl font-bold text-white">
                                    {mode === "register" ? "Create Account" : "Welcome Back"}
                                </h2>
                                <p className="text-white/40 font-medium">
                                    Start your journey to peak productivity.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => handleSocialLogin("github")}
                                    className="w-full bg-white text-black hover:bg-white/90 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Github className="w-5 h-5" />
                                    Continue with GitHub
                                </button>
                                <button
                                    onClick={() => handleSocialLogin("google")}
                                    className="w-full bg-white/5 border border-white/10 hover:bg-white/10 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Continue with Google
                                </button>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-[#111] px-2 text-white/20 px-2 rounded-full">Or continue with mail</span>
                                </div>
                            </div>

                            <form onSubmit={handleEmailAuth} className="space-y-4">
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 transition-all text-white placeholder:text-white/20"
                                />
                                <button type="submit" className="w-full py-4 rounded-2xl font-bold transition-colors text-white" style={{ backgroundColor: theme.colors.primary.blue }}>
                                    {mode === "register" ? "Create Account" : "Sign In"}
                                </button>
                            </form>

                            <div className="text-center pt-4">
                                <button
                                    onClick={() => setMode(mode === "login" ? "register" : "login")}
                                    className="text-sm text-white/40 hover:text-white transition-colors"
                                >
                                    {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                                </button>
                            </div>

                            <button
                                onClick={() => setMode("landing")}
                                className="w-full text-white/20 hover:text-white/40 py-2 text-sm transition-colors"
                            >
                                Back to Main
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
