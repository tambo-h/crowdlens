"use client";

import React from "react";
import { MessageThreadFull } from "./message-thread-full";
import { ChevronRight, ChevronLeft, MessageSquare, X } from "lucide-react";
import { useProductivity } from "@/context/productivity-context";
import { cn } from "@/lib/utils";

export function ChatSidePanel() {
    const { isChatOpen, setIsChatOpen } = useProductivity();

    return (
        <>
            {/* Floating Toggle Button (visible when closed) */}
            {!isChatOpen && (
                <button
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-6 right-6 z-50 p-4 bg-primary text-primary-foreground rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group"
                    aria-label="Open Tambo AI"
                >
                    <div className="relative">
                        <MessageSquare className="w-6 h-6 transition-transform group-hover:rotate-12" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-primary animate-pulse" />
                    </div>
                </button>
            )}

            {/* Side Panel */}
            <div
                className={cn(
                    "fixed top-0 right-0 h-full z-50 transition-all duration-500 ease-in-out border-l border-border bg-card shadow-2xl overflow-hidden flex flex-col",
                    isChatOpen ? "w-[30%] opacity-100" : "w-0 opacity-0"
                )}
            >
                {/* Panel Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
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
                            onClick={() => setIsChatOpen(false)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                            title="Close panel"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Chat Thread */}
                <div className="flex-1 overflow-hidden">
                    <MessageThreadFull hideHeader />
                </div>
            </div>
        </>
    );
}
