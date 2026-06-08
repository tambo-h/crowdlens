"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, LogOut, User, Key, ChevronDown, Chrome, Palette } from "lucide-react";
import { useProductivity, THEMES } from "@/context/productivity-context";
import { cn } from "@/lib/utils";

export function ProfileMenu() {
    const { userId, setUserId, googleProfile, isGoogleUser, googleLogout, setIsOnboardingOpen, theme, setTheme } = useProductivity();
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const pin = !isGoogleUser ? (userId?.split("_")[1] || "") : "";

    const copyPin = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(pin);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const logout = async () => {
        if (isGoogleUser) {
            await googleLogout();
        } else {
            localStorage.removeItem("taskstack_pin_id");
            setUserId(null);
        }
        setIsOpen(false);
    };

    const displayName = googleProfile?.name || "Guest User";
    const displayEmail = googleProfile?.email || null;
    const avatarUrl = googleProfile?.picture || null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1 pr-3 rounded-full bg-card border border-border hover:border-primary/50 transition-all outline-none group shadow-sm active:scale-95"
            >
                {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={avatarUrl}
                        alt={displayName}
                        className="w-8 h-8 rounded-full object-cover shadow-md"
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-md">
                        <User className="w-4 h-4" />
                    </div>
                )}
                {isGoogleUser && googleProfile?.name && (
                    <span className="text-xs font-bold text-foreground hidden sm:inline max-w-[100px] truncate">
                        {googleProfile.name.split(" ")[0]}
                    </span>
                )}
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
                            {/* Profile Header */}
                            <div className="p-5 border-b border-border bg-muted/30">
                                <div className="flex items-center gap-3 mb-1">
                                    {avatarUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={avatarUrl}
                                            alt={displayName}
                                            className="w-10 h-10 rounded-xl object-cover shadow-sm"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <User className="w-5 h-5" />
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <div className="text-sm font-bold text-foreground truncate">{displayName}</div>
                                        {displayEmail ? (
                                            <div className="text-[10px] text-muted-foreground truncate">{displayEmail}</div>
                                        ) : (
                                            <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Anonymous Session</div>
                                        )}
                                    </div>
                                </div>

                                {/* Google badge */}
                                {isGoogleUser && (
                                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest text-blue-400">
                                        <Chrome className="w-3 h-3" />
                                        Google Account
                                    </div>
                                )}
                            </div>

                            <div className="p-3 space-y-2">
                                {/* PIN section — only for guest PIN users */}
                                {!isGoogleUser && (
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
                                )}

                                {/* Theme Picker Section */}
                                <div className="p-4 border-b border-border space-y-2.5">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                                        <Palette className="w-3.5 h-3.5 text-indigo-400" />
                                        Visual Theme
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {THEMES.map((t) => {
                                            const isSelected = theme === t.id;
                                            return (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setTheme(t.id)}
                                                    className={cn(
                                                        "relative h-9 rounded-xl border flex items-center justify-center cursor-pointer transition-all active:scale-90 hover:scale-105",
                                                        isSelected 
                                                            ? "border-primary ring-2 ring-primary/20 bg-muted/40 shadow-sm" 
                                                            : "border-border hover:border-muted-foreground/30"
                                                    )}
                                                    title={t.name}
                                                >
                                                    {/* Overlapping mini color bubbles inside the button */}
                                                    <div className="flex items-center -space-x-1.5">
                                                        <div className="w-3.5 h-3.5 rounded-full border border-black/5" style={{ backgroundColor: t.previewColors[0] }} />
                                                        <div className="w-3.5 h-3.5 rounded-full border border-black/5" style={{ backgroundColor: t.previewColors[1] }} />
                                                        <div className="w-3.5 h-3.5 rounded-full border border-black/5" style={{ backgroundColor: t.previewColors[3] }} />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                 <button
                                    onClick={() => {
                                        setIsOnboardingOpen(true);
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-foreground hover:bg-muted transition-all group"
                                >
                                    <User className="w-4 h-4 group-hover:scale-110 transition-transform text-emerald-400" />
                                    Edit Persona
                                </button>

                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-destructive hover:bg-destructive/10 transition-all group"
                                >
                                    <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    {isGoogleUser ? "Sign Out" : "Logout Session"}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
