/**
 * @file gamification-panel.tsx
 * @description Full gamification panel: level, XP, streak, achievements, recent activity
 */

"use client";

import { z } from "zod";
import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import {
  Zap,
  Trophy,
  Flame,
  TrendingUp,
  Sparkles,
  Award,
  Crown,
  Target,
  Calendar,
  History,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProductivity } from "@/context/productivity-context";
import {
  ACHIEVEMENTS,
  LEVELS,
} from "@/services/gamification-config";
import {
  type UserGamification,
  type XPEvent,
  getUserStats,
  getGlobalLeaderboard,
  type LeaderboardEntry,
} from "@/services/gamification-service";
import { useXPToast } from "./xp-toast";
import { LevelBadge } from "./level-badge";

export const gamificationPanelSchema = z.object({
  showLeaderboard: z.boolean().default(false).describe("Show the global leaderboard section"),
  showAchievements: z.boolean().default(true).describe("Show unlocked and locked achievements"),
  showHistory: z.boolean().default(true).describe("Show recent XP history"),
});

type GamificationPanelProps = z.input<typeof gamificationPanelSchema>;

const formatRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
};

export function GamificationPanel({
  showLeaderboard = false,
  showAchievements = true,
  showHistory = true,
}: GamificationPanelProps) {
  const { userId, creativeRefreshTrigger } = useProductivity();
  const { show: showXPToast } = useXPToast();
  const [stats, setStats] = useState<UserGamification | null>(null);
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [prevLevel, setPrevLevel] = useState<number | null>(null);
  const [prevAchievementCount, setPrevAchievementCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const data = await getUserStats(userId);
    setStats(data);
    if (showLeaderboard) {
      const b = await getGlobalLeaderboard(8);
      setBoard(b);
    }
  }, [userId, showLeaderboard]);

  useEffect(() => {
    void refresh();
  }, [refresh, creativeRefreshTrigger]);

  // Toast on level-up and new achievements
  useEffect(() => {
    if (!stats) return;
    if (prevLevel !== null && stats.level.level > prevLevel) {
      showXPToast({
        levelUp: {
          level: stats.level.level,
          title: stats.level.title,
          emoji: stats.level.emoji,
        },
        label: `Reached ${stats.level.title}`,
        amount: 0,
      });
    }
    if (stats.achievements.length > prevAchievementCount) {
      const newest = stats.achievements[stats.achievements.length - 1];
      showXPToast({
        achievement: {
          id: newest.id,
          title: newest.title,
          emoji: newest.emoji,
          bonus: newest.bonus,
        },
        label: newest.description,
        amount: newest.bonus,
      });
    }
    setPrevLevel(stats.level.level);
    setPrevAchievementCount(stats.achievements.length);
  }, [stats, prevLevel, prevAchievementCount, showXPToast]);

  if (!stats) {
    return (
      <div className="bg-card/40 backdrop-blur-xl rounded-3xl p-8 border border-border/50">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="h-2 w-full bg-muted rounded" />
          <div className="h-20 w-full bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Level Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-card/60 to-accent/10 backdrop-blur-2xl rounded-[2rem] p-6 md:p-8 border border-border/50 shadow-2xl"
      >
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                Level {stats.level.level} • {stats.level.title}
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight mb-1">
              {stats.level.emoji} {stats.level.title}
            </h2>
            <p className="text-sm text-muted-foreground italic mb-5">"{stats.level.blurb}"</p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>{stats.xpInCurrentLevel} / {stats.xpForNextLevel} XP</span>
                <span>
                  {stats.nextLevel
                    ? `${stats.xpToNextLevel} to ${stats.nextLevel.title}`
                    : "Maxed out — legend."}
                </span>
              </div>
              <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.progressPercent}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-accent to-primary rounded-full"
                />
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1 font-bold">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  {stats.totalXP.toLocaleString()} total XP
                </span>
                {stats.streak >= 2 && (
                  <span className="flex items-center gap-1 font-bold text-orange-400">
                    <Flame className="w-3.5 h-3.5" />
                    {stats.streak}-day streak (×1.5 XP)
                  </span>
                )}
              </div>
            </div>
          </div>

          <LevelBadge
            level={stats.level.level}
            title={stats.level.title}
            emoji={stats.level.emoji}
            totalXP={stats.totalXP}
            xpInCurrentLevel={stats.xpInCurrentLevel}
            xpForNextLevel={stats.xpForNextLevel}
            xpToNextLevel={stats.xpToNextLevel}
            progressPercent={stats.progressPercent}
            streak={stats.streak}
            compact
          />
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickStat
          icon={<Trophy className="w-4 h-4" />}
          label="Achievements"
          value={`${stats.achievements.length} / ${ACHIEVEMENTS.length}`}
          color="text-yellow-500"
        />
        <QuickStat
          icon={<Target className="w-4 h-4" />}
          label="Focus Sessions"
          value={stats.pomodoroCount.toString()}
          color="text-primary"
        />
        <QuickStat
          icon={<TrendingUp className="w-4 h-4" />}
          label="Active Tracks"
          value={stats.activeRoles.length.toString()}
          color="text-accent"
        />
        <QuickStat
          icon={<Flame className="w-4 h-4" />}
          label="Streak"
          value={`${stats.streak} day${stats.streak === 1 ? "" : "s"}`}
          color="text-orange-400"
        />
      </div>

      {/* Level Roadmap */}
      <div className="bg-card/40 backdrop-blur-xl rounded-3xl p-6 border border-border/50">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Level Roadmap
        </h3>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
          {LEVELS.map((lvl) => {
            const reached = stats.totalXP >= lvl.threshold;
            const isCurrent = lvl.level === stats.level.level;
            return (
              <div
                key={lvl.level}
                className={cn(
                  "flex flex-col items-center min-w-[80px] p-3 rounded-2xl border transition-all",
                  isCurrent
                    ? "bg-primary/15 border-primary/50 scale-105 shadow-lg shadow-primary/20"
                    : reached
                    ? "bg-card/60 border-border/50"
                    : "bg-muted/20 border-border/30 opacity-50"
                )}
                title={lvl.blurb}
              >
                <div className="text-2xl mb-1">{lvl.emoji}</div>
                <div className="text-[9px] font-black uppercase tracking-wider text-foreground text-center leading-tight mb-0.5">
                  L{lvl.level}
                </div>
                <div className="text-[9px] font-bold text-muted-foreground text-center leading-tight">
                  {lvl.title.split(" ").slice(0, 2).join(" ")}
                </div>
                {isCurrent && (
                  <div className="text-[8px] font-black text-primary mt-1">YOU</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      {showAchievements && (
        <div className="bg-card/40 backdrop-blur-xl rounded-3xl p-6 border border-border/50">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-yellow-500" />
            Achievements
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = stats.achievements.some((u) => u.id === a.id);
              return (
                <motion.div
                  key={a.id}
                  whileHover={{ y: -2, scale: 1.02 }}
                  className={cn(
                    "p-4 rounded-2xl border text-center transition-all relative overflow-hidden",
                    unlocked
                      ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border-yellow-500/40 shadow-lg shadow-yellow-500/10"
                      : "bg-muted/20 border-border/30 opacity-60"
                  )}
                >
                  {unlocked && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/5 to-transparent pointer-events-none" />
                  )}
                  <div className={cn("text-3xl mb-2 relative", !unlocked && "grayscale")}>
                    {unlocked ? a.emoji : <Lock className="w-8 h-8 mx-auto text-muted-foreground" />}
                  </div>
                  <div className="text-[10px] font-black text-foreground uppercase tracking-wider mb-1 leading-tight">
                    {a.title}
                  </div>
                  <div className="text-[9px] text-muted-foreground leading-snug mb-2 min-h-[24px]">
                    {a.description}
                  </div>
                  <div className={cn(
                    "text-[9px] font-black px-2 py-0.5 rounded-full inline-block",
                    unlocked ? "bg-yellow-500/20 text-yellow-500" : "bg-muted text-muted-foreground"
                  )}>
                    +{a.bonus} XP
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent XP History */}
      {showHistory && stats.recentEvents.length > 0 && (
        <div className="bg-card/40 backdrop-blur-xl rounded-3xl p-6 border border-border/50">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-2">
            <History className="w-3.5 h-3.5 text-accent" />
            Recent XP Activity
          </h3>
          <div className="space-y-2">
            {stats.recentEvents.slice(0, 8).map((evt) => (
              <XPRow key={evt.id} event={evt} />
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard (optional) */}
      {showLeaderboard && board.length > 0 && (
        <div className="bg-card/40 backdrop-blur-xl rounded-3xl p-6 border border-border/50">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-2">
            <Crown className="w-3.5 h-3.5 text-primary" />
            Global Leaderboard
          </h3>
          <div className="space-y-2">
            {board.map((entry, idx) => (
              <div
                key={entry.userId}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-2xl border transition-all",
                  entry.userId === userId
                    ? "bg-primary/10 border-primary/40 shadow-md"
                    : "bg-muted/20 border-border/30"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs",
                  idx === 0 ? "bg-yellow-500/20 text-yellow-500" :
                  idx === 1 ? "bg-gray-400/20 text-gray-400" :
                  idx === 2 ? "bg-orange-500/20 text-orange-400" :
                  "bg-muted text-muted-foreground"
                )}>
                  {idx + 1}
                </div>
                <div className="text-xl">{entry.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-foreground truncate">
                    {entry.userId === userId ? "You" : entry.userId.slice(0, 12)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    L{entry.level} • {entry.title}
                  </div>
                </div>
                <div className="text-sm font-black text-primary tabular-nums">
                  {entry.xp.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Calendar nudge */}
      {stats.streak >= 3 && (
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-4 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-orange-400 shrink-0" />
          <div className="text-xs text-foreground font-medium">
            <span className="font-black text-orange-400">{stats.streak}-day streak!</span> Your
            XP multiplier is <span className="font-black text-primary">×1.5</span>. Don't break the
            chain — finish one more task today.
          </div>
        </div>
      )}
    </div>
  );
}

function QuickStat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-card/40 backdrop-blur-xl rounded-2xl p-4 border border-border/50">
      <div className={cn("mb-2", color)}>{icon}</div>
      <div className="text-xl font-black text-foreground leading-none tabular-nums">{value}</div>
      <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">
        {label}
      </div>
    </div>
  );
}

function XPRow({ event }: { event: XPEvent }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-3 rounded-2xl bg-muted/20 border border-border/30"
    >
      <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0">
        <Zap className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-foreground truncate">{event.label}</div>
        <div className="text-[9px] text-muted-foreground uppercase tracking-widest">
          {formatRelative(event.timestamp)}
          {event.multiplier > 1 && (
            <span className="ml-2 text-accent">×{event.multiplier.toFixed(2)} bonus</span>
          )}
        </div>
      </div>
      <div className="text-sm font-black text-primary tabular-nums">+{event.totalXP}</div>
    </motion.div>
  );
}
