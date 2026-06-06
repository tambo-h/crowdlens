/**
 * @file level-badge.tsx
 * @description Compact level badge with XP progress, designed for headers
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, TrendingUp, Flame, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export interface LevelBadgeProps {
  level: number;
  title: string;
  emoji: string;
  totalXP: number;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
  xpToNextLevel: number | null;
  progressPercent: number;
  streak: number;
  compact?: boolean;
  className?: string;
  /** If provided, shows a "View Journey" CTA that calls this on click. */
  onViewJourney?: () => void;
}

export function LevelBadge({
  level,
  title,
  emoji,
  totalXP,
  xpInCurrentLevel,
  xpForNextLevel,
  xpToNextLevel,
  progressPercent,
  streak,
  compact = false,
  className,
  onViewJourney,
}: LevelBadgeProps) {
  const [pop, setPop] = useState(false);
  const [prevLevel, setPrevLevel] = useState(level);

  useEffect(() => {
    if (level > prevLevel) {
      setPop(true);
      const t = setTimeout(() => setPop(false), 1500);
      setPrevLevel(level);
      return () => clearTimeout(t);
    }
    setPrevLevel(level);
  }, [level, prevLevel]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl rounded-3xl border border-border/60 shadow-lg shadow-primary/5 overflow-hidden",
        compact ? "p-3" : "p-5",
        className
      )}
    >
      <AnimatePresence>
        {pop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.4, y: -20 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-primary/20 backdrop-blur-sm rounded-3xl pointer-events-none"
          >
            <div className="text-center">
              <div className="text-3xl mb-1">🎉</div>
              <div className="text-xs font-black uppercase tracking-widest text-primary">Level Up!</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4">
        <motion.div
          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.05 }}
          transition={{ duration: 0.5 }}
          className={cn(
            "relative rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 flex items-center justify-center font-black shadow-inner shrink-0",
            compact ? "w-12 h-12 text-2xl" : "w-16 h-16 text-3xl"
          )}
        >
          <span>{emoji}</span>
          <div className="absolute -bottom-1 -right-1 bg-background border-2 border-primary rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-black text-primary">
            {level}
          </div>
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("font-black text-foreground leading-none truncate", compact ? "text-xs" : "text-sm")}>
              {title}
            </span>
            {streak >= 2 && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded-full">
                <Flame className="w-2.5 h-2.5" />
                {streak}d
              </span>
            )}
          </div>

          {!compact && (
            <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-primary" />
                {totalXP.toLocaleString()} XP
              </span>
              {xpToNextLevel !== null && xpToNextLevel > 0 && (
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-accent" />
                  {xpToNextLevel} to next
                </span>
              )}
            </div>
          )}

          <div className="relative h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-accent to-primary rounded-full"
            />
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              style={{ left: 0 }}
            />
          </div>

          {compact && (
            <div className="text-[9px] font-bold text-muted-foreground mt-1 tabular-nums">
              {xpInCurrentLevel}/{xpForNextLevel} XP
            </div>
          )}
        </div>
      </div>

      {onViewJourney && (
        <button
          onClick={onViewJourney}
          className="mt-3 w-full flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary hover:text-accent transition-colors py-1.5 rounded-xl hover:bg-primary/5"
        >
          View full journey
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </motion.div>
  );
}
