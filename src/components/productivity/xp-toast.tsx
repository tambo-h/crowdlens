/**
 * @file xp-toast.tsx
 * @description Floating "+XP" notification shown when a user gains XP
 */

"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Zap, Trophy, Flame, Crown, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export interface XPToast {
  id: string;
  amount: number;
  multiplier?: number;
  label: string;
  levelUp?: { level: number; title: string; emoji: string };
  achievement?: { id: string; title: string; emoji: string; bonus: number };
}

interface XPToastContextValue {
  show: (toast: Omit<XPToast, "id">) => void;
}

const XPToastContext = createContext<XPToastContextValue | null>(null);

export function XPToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<XPToast[]>([]);

  const show = useCallback((toast: Omit<XPToast, "id">) => {
    const id = `xp_t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const longest = toasts[0]?.achievement ? 5000 : 3200;
    const t = setTimeout(() => dismiss(toasts[0].id), longest);
    return () => clearTimeout(t);
  }, [toasts, dismiss]);

  return (
    <XPToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={cn(
                "pointer-events-auto relative min-w-[260px] max-w-sm rounded-2xl p-4 shadow-2xl border backdrop-blur-xl overflow-hidden",
                toast.achievement
                  ? "bg-gradient-to-br from-yellow-500/20 via-card to-orange-500/10 border-yellow-500/40"
                  : toast.levelUp
                  ? "bg-gradient-to-br from-primary/20 via-card to-accent/10 border-primary/40"
                  : "bg-card/90 border-primary/30"
              )}
            >
              {/* Shimmer */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
              />

              {toast.achievement ? (
                <div className="flex items-center gap-3">
                  <div className="text-4xl animate-bounce-slow">{toast.achievement.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-yellow-500 mb-0.5">
                      <Trophy className="w-3 h-3" />
                      Achievement Unlocked
                    </div>
                    <div className="font-black text-foreground text-sm leading-tight">{toast.achievement.title}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      +{toast.achievement.bonus} bonus XP
                    </div>
                  </div>
                </div>
              ) : toast.levelUp ? (
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{toast.levelUp.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-primary mb-0.5">
                      <Crown className="w-3 h-3" />
                      Level {toast.levelUp.level}
                    </div>
                    <div className="font-black text-foreground text-sm leading-tight">{toast.levelUp.title}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">You leveled up!</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: [0, -15, 15, 0] }}
                    transition={{ duration: 0.5 }}
                    className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0"
                  >
                    <Zap className="w-5 h-5" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="text-2xl font-black text-primary leading-none tabular-nums">
                      +{toast.amount} XP
                      {toast.multiplier && toast.multiplier > 1 && (
                        <span className="text-xs text-accent ml-1">×{toast.multiplier.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 truncate">
                      {toast.label}
                    </div>
                  </div>
                  <Sparkles className="w-4 h-4 text-accent animate-pulse shrink-0" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </XPToastContext.Provider>
  );
}

export function useXPToast() {
  const ctx = useContext(XPToastContext);
  if (!ctx) throw new Error("useXPToast must be used within XPToastProvider");
  return ctx;
}
