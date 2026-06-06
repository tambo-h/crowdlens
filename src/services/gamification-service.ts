/**
 * @file gamification-service.ts
 * @description Server actions for XP, levels, streaks, and achievements
 */

"use server";

import { redis } from "@/lib/upstash";
import {
  ACHIEVEMENTS,
  XP_VALUES,
  XP_ACTION_LABELS,
  getLevelForXP,
  getLevelProgress,
  type Achievement,
  type LevelDef,
  type XPAction,
} from "./gamification-config";

const keys = (userId: string) => ({
  xp: `xp:${userId}`,
  history: `xp_history:${userId}`,
  achievements: `achievements:${userId}`,
  streak: `streak:${userId}`,
  lastAction: `last_action:${userId}`,
  pomodoroCount: `pomo_count:${userId}`,
  roles: `active_roles:${userId}`,
});

export interface XPEvent {
  id: string;
  action: XPAction;
  baseXP: number;
  multiplier: number;
  totalXP: number;
  label: string;
  meta?: Record<string, any>;
  timestamp: string;
}

export interface UserGamification {
  totalXP: number;
  level: LevelDef;
  nextLevel: LevelDef | null;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
  xpToNextLevel: number;
  progressPercent: number;
  streak: number;
  achievements: Achievement[];
  recentEvents: XPEvent[];
  pomodoroCount: number;
  activeRoles: string[];
}

export interface LeaderboardEntry {
  userId: string;
  xp: number;
  level: number;
  title: string;
  emoji: string;
}

export async function awardXP({ userId, action, meta }: { userId: string; action: XPAction; meta?: Record<string, any> }): Promise<XPEvent | null> {
  if (!userId) return null;

  const k = keys(userId);
  const baseXP = XP_VALUES[action] ?? 1;
  let multiplier = 1;

  const today = new Date().toISOString().split("T")[0];
  const lastActionDate = (await redis.get<string>(k.lastAction)) || "";
  const isFirstToday = lastActionDate !== today;
  if (isFirstToday) {
    multiplier *= 1.25;
    await redis.set(k.lastAction, today);
  }

  const streak = (await redis.get<number>(k.streak)) || 0;
  if (streak >= 3) multiplier *= 1.5;

  const totalXP = Math.round(baseXP * multiplier);

  await redis.incrby(k.xp, totalXP);
  await redis.incrby(`xp_total:global`, totalXP);

  if (action === "pomodoro_complete") {
    await redis.incr(k.pomodoroCount);
  }
  if (action === "challenge_complete" && meta?.role) {
    const roles = (await redis.get<string[]>(k.roles)) || [];
    if (!roles.includes(meta.role)) {
      await redis.set(k.roles, [...roles, meta.role]);
    }
  }

  if (isFirstToday) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const hadYesterday = lastActionDate === yesterday;
    const newStreak = hadYesterday ? streak + 1 : 1;
    await redis.set(k.streak, newStreak);
  }

  const event: XPEvent = {
    id: `xp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    action,
    baseXP,
    multiplier,
    totalXP,
    label: XP_ACTION_LABELS[action] || action,
    meta,
    timestamp: new Date().toISOString(),
  };
  const history = (await redis.get<XPEvent[]>(k.history)) || [];
  history.unshift(event);
  await redis.set(k.history, history.slice(0, 50));

  void checkAchievements(userId);

  return event;
}

export async function getUserStats(userId: string): Promise<UserGamification> {
  const empty: UserGamification = {
    totalXP: 0,
    level: getLevelForXP(0),
    nextLevel: getLevelProgress(0).next,
    xpInCurrentLevel: 0,
    xpForNextLevel: 0,
    xpToNextLevel: 0,
    progressPercent: 0,
    streak: 0,
    achievements: [],
    recentEvents: [],
    pomodoroCount: 0,
    activeRoles: [],
  };
  if (!userId) return empty;

  const k = keys(userId);
  const [totalXP, history, achievementIds, streak, pomoCount, roles] = await Promise.all([
    redis.get<number>(k.xp),
    redis.get<XPEvent[]>(k.history),
    redis.get<string[]>(k.achievements),
    redis.get<number>(k.streak),
    redis.get<number>(k.pomodoroCount),
    redis.get<string[]>(k.roles),
  ]);

  const xp = totalXP || 0;
  const prog = getLevelProgress(xp);
  const unlockedIds = new Set(achievementIds || []);
  const achievements = ACHIEVEMENTS.filter((a) => unlockedIds.has(a.id));

  return {
    totalXP: xp,
    level: prog.level,
    nextLevel: prog.next,
    xpInCurrentLevel: prog.xpInCurrentLevel,
    xpForNextLevel: prog.xpForNextLevel,
    xpToNextLevel: prog.xpToNextLevel,
    progressPercent: prog.progressPercent,
    streak: streak || 0,
    achievements,
    recentEvents: (history || []).slice(0, 10),
    pomodoroCount: pomoCount || 0,
    activeRoles: roles || [],
  };
}

async function checkAchievements(userId: string) {
  const k = keys(userId);
  const unlocked = (await redis.get<string[]>(k.achievements)) || [];
  const unlockedSet = new Set(unlocked);
  const newlyUnlocked: Achievement[] = [];

  const totalXP = (await redis.get<number>(k.xp)) || 0;
  const streak = (await redis.get<number>(k.streak)) || 0;
  const pomoCount = (await redis.get<number>(k.pomodoroCount)) || 0;
  const roles = (await redis.get<string[]>(k.roles)) || [];
  const hour = new Date().getHours();

  const checks: { id: string; ok: boolean }[] = [
    { id: "first_blood",   ok: totalXP > 0 },
    { id: "streak_3",      ok: streak >= 3 },
    { id: "streak_7",      ok: streak >= 7 },
    { id: "pomo_10",       ok: pomoCount >= 10 },
    { id: "pomo_50",       ok: pomoCount >= 50 },
    { id: "track_master",  ok: roles.length > 0 },
    { id: "polymath",      ok: roles.length >= 3 },
    { id: "centurion",     ok: totalXP >= 100 },
  ];
  if (hour < 7)  checks.push({ id: "early_bird", ok: totalXP > 0 });
  if (hour >= 23) checks.push({ id: "night_owl", ok: totalXP > 0 });

  for (const c of checks) {
    if (c.ok && !unlockedSet.has(c.id)) {
      const ach = ACHIEVEMENTS.find((a) => a.id === c.id);
      if (ach) {
        newlyUnlocked.push(ach);
        unlockedSet.add(c.id);
      }
    }
  }

  if (newlyUnlocked.length > 0) {
    await redis.set(k.achievements, Array.from(unlockedSet));
    const bonusTotal = newlyUnlocked.reduce((s, a) => s + a.bonus, 0);
    if (bonusTotal > 0) await redis.incrby(k.xp, bonusTotal);
  }
}

export async function getGlobalLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const entries = (await redis.get<{ userId: string; xp: number }[]>("leaderboard:global")) || [];
  return entries
    .sort((a, b) => b.xp - a.xp)
    .slice(0, limit)
    .map((e) => {
      const lvl = getLevelForXP(e.xp);
      return { ...e, level: lvl.level, title: lvl.title, emoji: lvl.emoji };
    });
}

export async function syncLeaderboard(userId: string) {
  if (!userId) return;
  const xp = (await redis.get<number>(keys(userId).xp)) || 0;
  const board = (await redis.get<{ userId: string; xp: number }[]>("leaderboard:global")) || [];
  const idx = board.findIndex((e) => e.userId === userId);
  if (idx >= 0) board[idx] = { userId, xp };
  else board.push({ userId, xp });
  await redis.set("leaderboard:global", board);
}
