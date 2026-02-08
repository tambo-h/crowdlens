"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, LogOut, User, Key, ChevronDown } from "lucide-react";
import { useProductivity } from "@/context/productivity-context";
import { cn } from "@/lib/utils";

export function ProfileMenu() {
    const { userId, setUserId } = useProductivity();
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const pin = userId?.split("_")[1] || "";

    const copyPin = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(pin);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const logout = () => {
        localStorage.removeItem("taskstack_pin_id");
        setUserId(null);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1 pr-3 rounded-full bg-card border border-border hover:border-primary/50 transition-all outline-none group shadow-sm active:scale-95"
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-md">
                    <User className="w-4 h-4" />
                </div>
                <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                            className="absolute right-0 mt-3 w-72 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
                            style={{ transformOrigin: 'top right' }}
                        >
                            <div className="p-5 border-b border-border bg-muted/30">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-foreground">Guest User</div>
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Anonymous Session</div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 space-y-2">
                                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                            <Key className="w-3 h-3" />
                                            Recovery PIN
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-2xl font-black tracking-[0.3em] text-foreground font-mono bg-background px-3 py-1 rounded-lg border border-border">
                                            {pin}
                                        </span>
                                        <button
                                            onClick={copyPin}
                                            className={cn(
                                                "w-10 h-10 flex items-center justify-center rounded-xl transition-all",
                                                copied ? "bg-green-500 text-white" : "bg-primary text-primary-foreground hover:scale-110"
                                            )}
                                            title="Copy PIN"
                                        >
                                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                                        Keep this PIN safe to recover your workspace on other devices.
                                    </p>
                                </div>

                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-destructive hover:bg-destructive/10 transition-all group"
                                >
                                    <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    Logout Session
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
