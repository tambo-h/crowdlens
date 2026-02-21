"use client";

import React, { useState } from "react";
import { MessageThreadFull } from "./message-thread-full";
import { ThreadHistory, ThreadHistoryHeader, ThreadHistoryList, ThreadHistoryNewButton, ThreadHistorySearch } from "./thread-history";
import { ChevronRight, ChevronLeft, MessageSquare, X, History, Maximize2, Minimize2, GripHorizontal, Sparkles } from "lucide-react";
import { useProductivity } from "@/context/productivity-context";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function ChatSidePanel() {
    const { isChatOpen, setIsChatOpen } = useProductivity();
    const [showHistory, setShowHistory] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [panelWidth, setPanelWidth] = useState(400);

    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {/* Floating Toggle Button */}
            <AnimatePresence>
                {!isChatOpen && (
                    <motion.button
                        initial={{ scale: 0, rotate: -45, filter: "blur(10px)" }}
                        animate={{ scale: 1, rotate: 0, filter: "blur(0px)" }}
                        exit={{ scale: 0, rotate: 45, filter: "blur(10px)" }}
                        whileHover={{ scale: 1.1, y: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsChatOpen(true)}
                        className="fixed bottom-8 right-8 z-50 p-5 bg-primary text-primary-foreground rounded-3xl shadow-[0_20px_50px_rgba(99,102,241,0.4)] hover:shadow-[0_25px_60px_rgba(99,102,241,0.5)] transition-all duration-500 group pointer-events-auto border border-white/20"
                    >
                        <div className="relative">
                            <MessageSquare className="w-6 h-6" />
                            <motion.span
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-primary"
                            />
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Resizable Chat Window */}
            <AnimatePresence mode="wait">
                {isChatOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: "20%", scale: 0.95, filter: "blur(20px)" }}
                        animate={{
                            opacity: 1,
                            x: 0,
                            scale: 1,
                            filter: "blur(0px)",
                            width: isFullscreen ? "100vw" : Math.max(350, Math.min(panelWidth, 850)),
                        }}
                        exit={{ opacity: 0, x: "20%", scale: 0.95, filter: "blur(20px)" }}
                        transition={{ type: "spring", stiffness: 200, damping: 25 }}
                        className={cn(
                            "fixed top-4 right-4 bottom-4 flex flex-col glass-dark border border-white/10 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] pointer-events-auto origin-right overflow-hidden",
                            isFullscreen ? "top-0 right-0 bottom-0 left-0 rounded-0" : ""
                        )}
                        style={{
                            maxWidth: isFullscreen ? "100vw" : "90vw",
                            direction: "rtl"
                        }}
                    >
                        <div style={{ direction: "ltr" }} className="w-full h-full flex flex-col overflow-hidden relative">
                            {/* Panel Header */}
                            <header className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5 backdrop-blur-md">
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        animate={{
                                            boxShadow: ["0 0 0 0px rgba(99,102,241,0)", "0 0 0 10px rgba(99,102,241,0.1)", "0 0 0 0px rgba(99,102,241,0)"]
                                        }}
                                        transition={{ repeat: Infinity, duration: 3 }}
                                        className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg"
                                    >
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </motion.div>
                                    <div>
                                        <h2 className="text-sm font-black text-white uppercase tracking-tighter">Tambo Intelligence</h2>
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3].map(i => (
                                                    <motion.span
                                                        key={i}
                                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                                        transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                                                        className="w-1 h-3 bg-green-500/50 rounded-full"
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[10px] text-green-400 font-black uppercase tracking-widest">Active System</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {[
                                        { icon: <History className="w-4 h-4" />, action: () => setShowHistory(!showHistory), active: showHistory, label: "History" },
                                        { icon: isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />, action: () => setIsFullscreen(!isFullscreen), label: isFullscreen ? "Collapse" : "Expand" },
                                        { icon: <X className="w-4 h-4" />, action: () => setIsChatOpen(false), label: "Dismiss" }
                                    ].map((btn, i) => (
                                        <button
                                            key={i}
                                            onClick={btn.action}
                                            className={cn(
                                                "p-3 rounded-xl transition-all duration-300 flex items-center justify-center",
                                                btn.active
                                                    ? "bg-primary text-white scale-110 shadow-lg"
                                                    : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 hover:scale-105"
                                            )}
                                        >
                                            {btn.icon}
                                        </button>
                                    ))}
                                </div>
                            </header>

                            <div className="flex-1 flex overflow-hidden">
                                {showHistory && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="w-full sm:w-80 border-r border-white/10 bg-black/20 backdrop-blur-xl absolute sm:relative inset-y-0 left-0 z-10"
                                    >
                                        <ThreadHistory defaultCollapsed={false} className="border-none h-full bg-transparent">
                                            <ThreadHistoryHeader />
                                            <div className="px-4 pb-4">
                                                <ThreadHistoryNewButton className="w-full py-6 rounded-2xl bg-primary/10 border-primary/20 text-primary hover:bg-primary text-sm font-bold shadow-none" />
                                            </div>
                                            <ThreadHistorySearch className="px-4" />
                                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                                <ThreadHistoryList />
                                            </div>
                                        </ThreadHistory>
                                    </motion.div>
                                )}

                                <div className="flex-1 overflow-hidden h-full flex flex-col bg-black/10">
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="flex-1 overflow-hidden"
                                    >
                                        <MessageThreadFull hideHeader />
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
