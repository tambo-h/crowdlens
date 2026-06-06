/**
 * @file level-journey.tsx
 * @description Vertical "Climb" timeline showing all 13 levels.
 *              Current level glows, the next level has a big "X XP to go"
 *              callout, completed levels collapse, far future levels dim.
 *
 *              Designed to replace the dashboard's single progress bar and
 *              serve as the dedicated "Journey" view.
 */

"use client";

import { motion } from "framer-motion";
import { Check, Crown, Flag, Mountain, Sparkles, TrendingUp, Zap, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LEVELS,
  getLevelForXP,
  getLevelProgress,
  type LevelDef,
} from "@/services/gamification-config";

export interface LevelJourneyProps {
  totalXP: number;
  streak?: number;
  className?: string;
}

type Status = "completed" | "current" | "next" | "near" | "far";

function getStatus(level: LevelDef, currentLevelNumber: number, hasNext: boolean): Status {
  if (level.level < currentLevelNumber) return "completed";
  if (level.level === currentLevelNumber) return "current";
  if (hasNext && level.level === currentLevelNumber + 1) return "next";
  if (level.level <= currentLevelNumber + 2) return "near";
  return "far";
}

const STATUS_STYLES: Record<
  Status,
  { row: string; badge: string; text: string; showBlurb: boolean; showConnector: boolean }
> = {
  completed: {
    row: "bg-card/30 border-border/40",
    badge: "bg-primary/15 text-primary border-primary/30",
    text: "text-muted-foreground",
    showBlurb: false,
    showConnector: true,
  },
  current: {
    row: "bg-gradient-to-r from-primary/20 via-primary/10 to-accent/10 border-primary/50 shadow-xl shadow-primary/10",
    badge: "bg-gradient-to-br from-primary to-accent text-primary-foreground border-0 shadow-lg shadow-primary/40",
    text: "text-foreground",
    showBlurb: true,
    showConnector: true,
  },
  next: {
    row: "bg-gradient-to-r from-accent/15 via-card to-primary/5 border-accent/40 shadow-lg shadow-accent/10",
    badge: "bg-accent/20 text-accent border-accent/40",
    text: "text-foreground",
    showBlurb: true,
    showConnector: true,
  },
  near: {
    row: "bg-card/50 border-border/40",
    badge: "bg-muted text-muted-foreground border-border",
    text: "text-muted-foreground",
    showBlurb: false,
    showConnector: true,
  },
  far: {
    row: "bg-muted/20 border-border/30 opacity-60",
    badge: "bg-muted text-muted-foreground/70 border-border/50",
    text: "text-muted-foreground/70",
    showBlurb: false,
    showConnector: true,
  },
};

export function LevelJourney({ totalXP, streak = 0, className }: LevelJourneyProps) {
  const { level: currentLevel, next: nextLevel, xpToNextLevel, progressPercent } = getLevelProgress(totalXP);
  const currentLevelNumber = currentLevel.level;
  const hasNext = !!nextLevel;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Hero: Current level + next target */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-card/80 to-accent/10 rounded-3xl p-6 md:p-8 border border-border/50 shadow-2xl">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          {/* Current level emoji bubble */}
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10 flex items-center justify-center text-7xl shadow-inner"
            >
              {currentLevel.emoji}
            </motion.div>
            <div className="absolute -bottom-2 -right-2 bg-background border-2 border-primary rounded-2xl px-2.5 py-1 shadow-lg">
              <div className="flex items-center gap-1">
                <Crown className="w-3 h-3 text-primary" />
                <span className="text-xs font-black text-primary">L{currentLevel.level}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
              You are here
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight leading-none mb-2">
              {currentLevel.title}
            </h2>
            <p className="text-sm text-muted-foreground italic mb-4">
              "{currentLevel.blurb}"
            </p>

            {nextLevel ? (
              <div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">
                  <span>Climb to {nextLevel.title}</span>
                  <span className="text-accent">{xpToNextLevel} XP to go</span>
                </div>
                <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-accent to-primary rounded-full"
                  />
                  <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span className="font-bold tabular-nums">
                    {totalXP.toLocaleString()} / {nextLevel.threshold.toLocaleString()} XP
                  </span>
                  {streak >= 3 && (
                    <span className="inline-flex items-center gap-0.5 text-orange-400 font-bold">
                      <Zap className="w-3 h-3" /> ×1.5 streak bonus active
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm font-black text-yellow-500 uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start">
                <Crown className="w-4 h-4" /> Max level — you legend.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* The Climb — vertical timeline of all 13 levels */}
      <div className="bg-card/40 backdrop-blur-xl rounded-3xl p-5 md:p-6 border border-border/50 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
            <Mountain className="w-4 h-4 text-primary" />
            The Climb — 13 Levels
          </h3>
          <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary" /> Done
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent" /> Now
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-accent" /> Next
            </span>
          </div>
        </div>

        <div className="relative">
          {LEVELS.map((lvl, idx) => {
            const status = getStatus(lvl, currentLevelNumber, hasNext);
            const styles = STATUS_STYLES[status];
            const isLast = idx === LEVELS.length - 1;
            const isCurrent = status === "current";
            const isCompleted = status === "completed";
            const isNext = status === "next";
            const isFinalSummit = lvl.level === 13;
            const xpGapFromPrev =
              idx === 0 ? lvl.threshold : lvl.threshold - LEVELS[idx - 1].threshold;
            const xpToHere =
              status === "completed" || isCurrent
                ? 0
                : Math.max(0, lvl.threshold - totalXP);

            return (
              <div key={lvl.level} className="relative flex items-stretch gap-3 md:gap-4">
                {/* Connector column */}
                <div className="flex flex-col items-center pt-3">
                  {/* Badge */}
                  <motion.div
                    initial={false}
                    animate={isCurrent ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                    transition={isCurrent ? { duration: 2, repeat: Infinity } : { duration: 0 }}
                    className={cn(
                      "relative w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-2xl md:text-3xl border-2 shrink-0 transition-all",
                      styles.badge
                    )}
                  >
                    {isCompleted ? <Check className="w-6 h-6" /> : lvl.emoji}
                    {isCurrent && (
                      <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 rounded-2xl border-2 border-primary"
                      />
                    )}
                    {isFinalSummit && !isCurrent && !isCompleted && (
                      <Flag className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500" />
                    )}
                  </motion.div>

                  {/* Connector line */}
                  {!isLast && (
                    <div className="flex-1 w-0.5 min-h-[20px] my-1 relative">
                      <div
                        className={cn(
                          "absolute inset-0",
                          isCompleted ? "bg-primary/60" : "bg-border"
                        )}
                      />
                      {isCurrent && (
                        <motion.div
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          style={{ transformOrigin: "top" }}
                          className="absolute inset-0 bg-gradient-to-b from-primary to-accent"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Content card */}
                <div className={cn("flex-1 mb-2 rounded-2xl border p-4 transition-all", styles.row)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                          Level {lvl.level}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] font-black uppercase tracking-widest bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                        {isNext && (
                          <span className="text-[9px] font-black uppercase tracking-widest bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                            Next up
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                            ✓ Cleared
                          </span>
                        )}
                        {isFinalSummit && !isCurrent && !isCompleted && (
                          <span className="text-[9px] font-black uppercase tracking-widest text-yellow-500">
                            🏆 Final boss
                          </span>
                        )}
                      </div>
                      <h4 className={cn("text-base md:text-lg font-black leading-tight mt-0.5", styles.text)}>
                        {lvl.title}
                      </h4>
                      {styles.showBlurb && (
                        <p className="text-xs text-muted-foreground italic mt-1 leading-snug">
                          "{lvl.blurb}"
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] font-bold text-muted-foreground">
                        <span className="tabular-nums">{lvl.threshold.toLocaleString()} XP</span>
                        {idx > 0 && (
                          <span className="text-muted-foreground/60">
                            · +{xpGapFromPrev.toLocaleString()} from previous
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right callout */}
                    <div className="shrink-0 text-right">
                      {isCurrent && (
                        <div>
                          <div className="text-2xl font-black text-primary tabular-nums">
                            {progressPercent}%
                          </div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                            to {nextLevel?.title.split(" ")[0]}
                          </div>
                        </div>
                      )}
                      {isNext && (
                        <div>
                          <div className="text-2xl font-black text-accent tabular-nums">
                            {xpToNextLevel}
                          </div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                            XP to climb
                          </div>
                        </div>
                      )}
                      {isCompleted && (
                        <div className="text-[9px] font-black uppercase tracking-widest text-primary">
                          Done
                        </div>
                      )}
                      {(status === "near" || status === "far") && xpToHere > 0 && (
                        <div>
                          <div className="text-sm font-black text-muted-foreground tabular-nums">
                            {xpToHere.toLocaleString()}
                          </div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                            XP away
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mini progress bar for current level */}
                  {isCurrent && (
                    <div className="mt-3">
                      <div className="relative h-1.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Mini progress bar for next level (faded, showing distance) */}
                  {isNext && nextLevel && (
                    <div className="mt-3">
                      <div className="relative h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-accent/40 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              ((nextLevel.threshold - xpToNextLevel) /
                                Math.max(1, nextLevel.threshold - currentLevel.threshold)) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer hint */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20">
        <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-black text-foreground">Pro tip:</span> every task you check
          off, every focus session, every standup you log — all of it pushes you up the
          climb. The higher you go, the funkier your title gets.{" "}
          <span className="font-black text-primary">Productivity Master</span> awaits.
        </div>
      </div>
    </div>
  );
}
