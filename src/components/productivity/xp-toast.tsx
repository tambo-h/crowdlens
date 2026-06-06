/**
 * @file xp-toast.tsx
 * @description Real-time XP feedback: floating "+XP" near a click,
 *               bottom-right XP toasts, top banner nudges.
 */

"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Zap, Trophy, Flame, Crown, Award, X, PartyPopper, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NudgeVariant } from "@/services/nudges-config";

/* ------------------------------------------------------------------ */
/* Toast shapes                                                        */
/* ------------------------------------------------------------------ */

export interface XPToast {
  id: string;
  amount: number;
  multiplier?: number;
  label: string;
  levelUp?: { level: number; title: string; emoji: string };
  achievement?: { id: string; title: string; emoji: string; bonus: number };
}

export interface FloatingXP {
  id: string;
  amount: number;
  multiplier?: number;
  x: number;
  y: number;
}

export interface NudgeBanner {
  id: string;
  message: string;
  emoji: string;
  variant: NudgeVariant;
  /** Optional: subtitle / supporting line */
  sub?: string;
}

interface XPFeedbackContextValue {
  // Bottom-right stack of XP toasts
  showXP: (toast: Omit<XPToast, "id">) => void;
  // Floating "+XP" that flies up from a click point
  showFloatingXP: (floating: Omit<FloatingXP, "id">) => void;
  // Top banner for encouragement / level-up / achievement flavor
  showNudge: (nudge: Omit<NudgeBanner, "id">) => void;
}

const XPFeedbackContext = createContext<XPFeedbackContextValue | null>(null);

/* ------------------------------------------------------------------ */
/* Visual helpers                                                      */
/* ------------------------------------------------------------------ */

const VARIANT_STYLES: Record<NudgeVariant, string> = {
  small:
    "bg-card/90 border-primary/30 text-foreground",
  medium:
    "bg-gradient-to-r from-primary/15 via-card to-accent/15 border-primary/40 text-foreground",
  celebration:
    "bg-gradient-to-r from-yellow-500/20 via-card to-orange-500/15 border-yellow-500/50 text-foreground",
};

const VARIANT_ICON: Record<NudgeVariant, React.ReactNode> = {
  small: <Sparkles className="w-4 h-4" />,
  medium: <Zap className="w-4 h-4" />,
  celebration: <PartyPopper className="w-5 h-5" />,
};

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export function XPToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<XPToast[]>([]);
  const [floats, setFloats] = useState<FloatingXP[]>([]);
  const [banners, setBanners] = useState<NudgeBanner[]>([]);

  // Refs for cleanup
  const dismissTimers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissFloat = useCallback((id: string) => {
    setFloats((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const dismissBanner = useCallback((id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const scheduleDismiss = useCallback(
    (id: string, ms: number) => {
      const t = setTimeout(() => dismissToast(id), ms);
      dismissTimers.current.add(t);
      return t;
    },
    [dismissToast]
  );

  // XP toast (bottom right)
  const showXP = useCallback(
    (toast: Omit<XPToast, "id">) => {
      const id = `xp_t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { ...toast, id }]);
      const ms = toast.achievement ? 5000 : 3000;
      scheduleDismiss(id, ms);
    },
    [scheduleDismiss]
  );

  // Floating +XP (positioned at click point)
  const showFloatingXP = useCallback(
    (floating: Omit<FloatingXP, "id">) => {
      const id = `xp_f_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      setFloats((prev) => [...prev, { ...floating, id }]);
      const t = setTimeout(() => dismissFloat(id), 1500);
      dismissTimers.current.add(t);
    },
    [dismissFloat]
  );

  // Banner nudge (top)
  const showNudge = useCallback(
    (nudge: Omit<NudgeBanner, "id">) => {
      const id = `xp_n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      setBanners((prev) => {
        // Cap to 1 banner at a time, replace any existing one
        return [{ ...nudge, id }, ...prev].slice(0, 1);
      });
      const ms = nudge.variant === "celebration" ? 4500 : 3200;
      const t = setTimeout(() => dismissBanner(id), ms);
      dismissTimers.current.add(t);
    },
    [dismissBanner]
  );

  // Cleanup on unmount
  useEffect(() => {
    const timers = dismissTimers.current;
    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  return (
    <XPFeedbackContext.Provider value={{ showXP, showFloatingXP, showNudge }}>
      {children}

      {/* Floating +XP */}
      <div className="fixed inset-0 pointer-events-none z-[110]">
        <AnimatePresence>
          {floats.map((f) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 0, scale: 0.5, x: 0 }}
              animate={{ opacity: [0, 1, 1, 0], y: -90, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: "easeOut" }}
              className="absolute pointer-events-none"
              style={{ left: f.x, top: f.y }}
            >
              <div className="relative -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="text-3xl font-black text-primary drop-shadow-[0_0_12px_rgba(99,102,241,0.6)] tabular-nums whitespace-nowrap">
                  +{f.amount} XP
                </div>
                {f.multiplier && f.multiplier > 1 && (
                  <div className="text-[10px] font-black text-accent bg-accent/10 px-2 py-0.5 rounded-full mt-0.5">
                    ×{f.multiplier.toFixed(2)} BONUS
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom-right XP toasts */}
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

      {/* Top nudge banner */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[120] flex flex-col gap-2 pointer-events-none w-full max-w-md px-4">
        <AnimatePresence>
          {banners.map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className={cn(
                "pointer-events-auto relative rounded-2xl border-2 shadow-2xl backdrop-blur-xl overflow-hidden",
                VARIANT_STYLES[b.variant]
              )}
            >
              {/* Shimmer */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{ duration: 1.6, ease: "easeOut" }}
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"
              />
              <div className="relative flex items-center gap-3 p-4">
                <div
                  className={cn(
                    "rounded-xl p-2 flex items-center justify-center shrink-0",
                    b.variant === "celebration"
                      ? "bg-yellow-500/20 text-yellow-500"
                      : b.variant === "medium"
                      ? "bg-primary/20 text-primary"
                      : "bg-accent/20 text-accent"
                  )}
                >
                  {VARIANT_ICON[b.variant]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">
                    <span className="text-base">{b.emoji}</span>
                    {b.variant === "celebration" ? "Milestone" : b.variant === "medium" ? "Nudge" : "Heads up"}
                  </div>
                  <div className="text-sm font-black text-foreground leading-tight">
                    {b.message}
                  </div>
                  {b.sub && (
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {b.sub}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => dismissBanner(b.id)}
                  className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-background/50 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </XPFeedbackContext.Provider>
  );
}

export function useXPToast() {
  const ctx = useContext(XPFeedbackContext);
  if (!ctx) throw new Error("useXPToast must be used within XPToastProvider");
  return ctx;
}
