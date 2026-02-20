"use client";

import React, { useState } from "react";
import { MessageThreadFull } from "./message-thread-full";
import { ThreadHistory, ThreadHistoryHeader, ThreadHistoryList, ThreadHistoryNewButton, ThreadHistorySearch } from "./thread-history";
import { ChevronRight, ChevronLeft, MessageSquare, X, History, Maximize2, Minimize2, GripHorizontal } from "lucide-react";
import { useProductivity } from "@/context/productivity-context";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function ChatSidePanel() {
    const { isChatOpen, setIsChatOpen } = useProductivity();
    const [showHistory, setShowHistory] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Add resizable panel support
    const [panelWidth, setPanelWidth] = useState(400);

    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {/* Floating Toggle Button (visible when closed) */}
            <AnimatePresence>
                {!isChatOpen && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        onClick={() => setIsChatOpen(true)}
                        className="fixed bottom-6 right-6 z-50 p-4 bg-primary text-primary-foreground rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group pointer-events-auto"
                        aria-label="Open Tambo AI"
                    >
                        <div className="relative">
                            <MessageSquare className="w-6 h-6 transition-transform group-hover:rotate-12" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-primary animate-pulse" />
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Resizable Chat Window */}
            <AnimatePresence>
                {isChatOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{
                            opacity: 1,
                            x: 0,
                            width: isFullscreen ? "100vw" : Math.max(300, Math.min(panelWidth, 800)),
                        }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={cn(
                            "fixed top-0 right-0 h-full flex flex-col bg-card shadow-2xl pointer-events-auto origin-right resize-x overflow-hidden border-l border-border",
                            isFullscreen ? "border-0" : ""
                        )}
                        style={{
                            maxWidth: isFullscreen ? "100vw" : "90vw",
                            direction: "rtl" // for native resize on left border
                        }}
                    >
                        <div style={{ direction: "ltr" }} className="w-full h-full flex flex-col overflow-hidden">
                            {/* Panel Header */}
                            <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <span className="text-xl">✨</span>
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-foreground">Tambo AI</h2>
                                        <div className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Online</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onClick={() => setShowHistory(!showHistory)}
                                        className={cn(
                                            "p-2 rounded-lg transition-colors",
                                            showHistory ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                        )}
                                        title="Toggle history"
                                    >
                                        <History className="w-4 h-4" />
                                    </button>
                                    <button
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onClick={() => setIsFullscreen(!isFullscreen)}
                                        className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                                        title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                                    >
                                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onClick={() => setIsChatOpen(false)}
                                        className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                                        title="Close panel"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 flex overflow-hidden">
                                {/* Thread History Sidebar */}
                                {showHistory && (
                                    <div className="w-full sm:w-64 border-r border-border animate-in slide-in-from-left duration-300 absolute sm:relative inset-y-0 left-0 bg-card z-10 sm:z-0">
                                        <ThreadHistory defaultCollapsed={false} className="border-none h-full">
                                            <ThreadHistoryHeader />
                                            <ThreadHistoryNewButton className="w-full" />
                                            <ThreadHistorySearch />
                                            <ThreadHistoryList />
                                        </ThreadHistory>
                                    </div>
                                )}

                                {/* Chat Thread */}
                                <div className="flex-1 overflow-hidden h-full flex flex-col">
                                    <MessageThreadFull hideHeader />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
