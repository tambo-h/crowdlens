"use client";

import React, { useState } from "react";
import { MessageThreadFull } from "./message-thread-full";
import { MessageCircle, X, ChevronDown, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function CollapsibleChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50 group"
            >
                <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-accent"></span>
                </span>
            </button>
        );
    }

    return (
        <div
            className={cn(
                "fixed bottom-6 right-6 bg-card border border-border shadow-2xl rounded-2xl flex flex-col transition-all z-50 overflow-hidden",
                isMinimized ? "w-80 h-14" : "w-[450px] h-[600px] max-h-[80vh]"
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border cursor-pointer select-none" onClick={() => setIsMinimized(!isMinimized)}>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-bold text-sm">Tambo AI Assistant</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMinimized(!isMinimized);
                        }}
                        className="p-1.5 hover:bg-muted rounded-md transition-colors"
                    >
                        {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                        }}
                        className="p-1.5 hover:bg-muted rounded-md transition-colors text-destructive"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Chat Body */}
            {!isMinimized && (
                <div className="flex-1 overflow-hidden relative">
                    <MessageThreadFull variant="compact" className="h-full" />
                </div>
            )}
        </div>
    );
}
