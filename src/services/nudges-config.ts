/**
 * @file nudges-config.ts
 * @description A large, configurable library of encouragement messages.
 *
 * Nudges fire after a user completes one or more tasks. They are *gentle*
 * (non-blocking) and intentionally a little funny.
 *
 * Categories:
 *  - milestone  : triggered by task count in a session
 *  - combo      : triggered by completing multiple tasks in a short window
 *  - streak     : triggered by streak length
 *  - speed      : triggered by very rapid completions
 *  - variety    : triggered by mixing roles/tracks
 *  - comeback   : triggered when returning after a gap
 *  - levelup    : extra flavor when a level is reached
 *  - generic    : ambient affirmations for any action
 */

export type NudgeCategory =
  | "milestone"
  | "combo"
  | "streak"
  | "speed"
  | "variety"
  | "comeback"
  | "levelup"
  | "generic";

export type NudgeVariant = "small" | "medium" | "celebration";

export interface NudgeMessage {
  id: string;
  category: NudgeCategory;
  message: string;
  emoji: string;
  variant: NudgeVariant;
  /** Probability weight (1 = default). Higher = more likely to be picked within a category. */
  weight?: number;
}

export interface MilestoneNudge extends NudgeMessage {
  category: "milestone";
  /** Trigger when session task count == this number */
  taskCount: number;
}

export interface ComboNudge extends NudgeMessage {
  category: "combo";
  /** Trigger when N tasks are completed within `windowMinutes` */
  taskCount: number;
  windowMinutes: number;
}

export interface StreakNudge extends NudgeMessage {
  category: "streak";
  /** Trigger when streak day count >= this number */
  streakDays: number;
}

export interface SpeedNudge extends NudgeMessage {
  category: "speed";
  /** Trigger when N tasks are completed within `windowMinutes` */
  taskCount: number;
  windowMinutes: number;
}

export interface VarietyNudge extends NudgeMessage {
  category: "variety";
  /** Trigger when user has hit >= N unique roles in a session */
  uniqueRoles: number;
}

export interface ComebackNudge extends NudgeMessage {
  category: "comeback";
  /** Trigger when last action was >= N hours ago */
  hoursSince: number;
}

export interface LevelUpNudge extends NudgeMessage {
  category: "levelup";
}

export interface GenericNudge extends NudgeMessage {
  category: "generic";
}

export type AnyNudge =
  | MilestoneNudge
  | ComboNudge
  | StreakNudge
  | SpeedNudge
  | VarietyNudge
  | ComebackNudge
  | LevelUpNudge
  | GenericNudge;

/* ------------------------------------------------------------------ */
/* Generic ambient messages — pick from these on every completion     */
/* ------------------------------------------------------------------ */

export const GENERIC_NUDGES: GenericNudge[] = [
  { id: "g1",  category: "generic", emoji: "✨", message: "Done. Onward.",            variant: "small", weight: 2 },
  { id: "g2",  category: "generic", emoji: "💪", message: "Another one bites the dust.", variant: "small", weight: 2 },
  { id: "g3",  category: "generic", emoji: "✅", message: "Checked, packed, shipped.", variant: "small", weight: 1 },
  { id: "g4",  category: "generic", emoji: "🧠", message: "Brain says thanks.",         variant: "small", weight: 1 },
  { id: "g5",  category: "generic", emoji: "🎯", message: "Bullseye.",                  variant: "small", weight: 1 },
  { id: "g6",  category: "generic", emoji: "🚀", message: "Velocity increasing.",       variant: "small", weight: 1 },
  { id: "g7",  category: "generic", emoji: "🧊", message: "Cool and efficient.",        variant: "small", weight: 1 },
  { id: "g8",  category: "generic", emoji: "🥷", message: "Stealth productivity.",      variant: "small", weight: 1 },
  { id: "g9",  category: "generic", emoji: "📦", message: "Boxed. Archived. Done.",     variant: "small", weight: 1 },
  { id: "g10", category: "generic", emoji: "🪄", message: "Tidy little win.",           variant: "small", weight: 1 },
  { id: "g11", category: "generic", emoji: "🐝", message: "Buzzing along nicely.",      variant: "small", weight: 1 },
  { id: "g12", category: "generic", emoji: "🛠️", message: "Built, not just planned.",  variant: "small", weight: 1 },
];

/* ------------------------------------------------------------------ */
/* Milestones — fired at exact task counts                            */
/* ------------------------------------------------------------------ */

export const MILESTONE_NUDGES: MilestoneNudge[] = [
  { id: "m2",  category: "milestone", taskCount: 2,  emoji: "👟", message: "Two down. The hardest part was starting.",       variant: "small" },
  { id: "m3",  category: "milestone", taskCount: 3,  emoji: "🔥", message: "Three in a row. You're on a roll.",              variant: "medium" },
  { id: "m4",  category: "milestone", taskCount: 4,  emoji: "🧠", message: "Four tasks. Your future self sends thanks.",     variant: "small" },
  { id: "m5",  category: "milestone", taskCount: 5,  emoji: "⚡", message: "FIVE! You're officially cooking.",              variant: "medium" },
  { id: "m6",  category: "milestone", taskCount: 6,  emoji: "🤖", message: "Six done. The machines are impressed.",          variant: "small" },
  { id: "m7",  category: "milestone", taskCount: 7,  emoji: "🍀", message: "Lucky seven. Don't jinx it — keep going.",      variant: "medium" },
  { id: "m8",  category: "milestone", taskCount: 8,  emoji: "🦾", message: "Eight? Octo-mode engaged.",                     variant: "small" },
  { id: "m9",  category: "milestone", taskCount: 9,  emoji: "🎯", message: "Nine for nine. Almost suspiciously on target.",  variant: "small" },
  { id: "m10", category: "milestone", taskCount: 10, emoji: "🏆", message: "TEN IN A ROW. The OS is taking notes.",         variant: "celebration" },
  { id: "m12", category: "milestone", taskCount: 12, emoji: "🥇", message: "Twelve. That's a full focused sprint.",         variant: "medium" },
  { id: "m15", category: "milestone", taskCount: 15, emoji: "🌋", message: "15 tasks. You're a productivity volcano.",      variant: "celebration" },
  { id: "m20", category: "milestone", taskCount: 20, emoji: "👑", message: "Twenty. Honestly, take a bow.",                 variant: "celebration" },
  { id: "m25", category: "milestone", taskCount: 25, emoji: "🪐", message: "25 tasks — you're operating on a different planet.", variant: "celebration" },
  { id: "m30", category: "milestone", taskCount: 30, emoji: "🛸", message: "30. We need to update your job title.",         variant: "celebration" },
];

/* ------------------------------------------------------------------ */
/* Combo — multiple tasks within a short window                       */
/* ------------------------------------------------------------------ */

export const COMBO_NUDGES: ComboNudge[] = [
  { id: "c1", category: "combo", taskCount: 3, windowMinutes: 5,  emoji: "⚡", message: "3 in 5 minutes. The focus furnace is on.",     variant: "medium" },
  { id: "c2", category: "combo", taskCount: 4, windowMinutes: 10, emoji: "🌪️", message: "4 in 10 minutes. Tiny productivity tornado.",  variant: "medium" },
  { id: "c3", category: "combo", taskCount: 5, windowMinutes: 15, emoji: "🚀", message: "5 in 15 minutes. Elon wants your secrets.",    variant: "celebration" },
  { id: "c4", category: "combo", taskCount: 3, windowMinutes: 2,  emoji: "🥷", message: "3 in 2 minutes. Blink-and-you-miss-it mode.",  variant: "medium" },
  { id: "c5", category: "combo", taskCount: 6, windowMinutes: 20, emoji: "🦾", message: "6 in 20 minutes. The cyborg arc begins.",      variant: "celebration" },
  { id: "c6", category: "combo", taskCount: 10, windowMinutes: 30, emoji: "🧨", message: "10 in 30 minutes. Blowing up the to-do list.", variant: "celebration" },
];

/* ------------------------------------------------------------------ */
/* Speed — extra fast                                                  */
/* ------------------------------------------------------------------ */

export const SPEED_NUDGES: SpeedNudge[] = [
  { id: "s1", category: "speed", taskCount: 2, windowMinutes: 1,  emoji: "⏱️", message: "Two in a minute. Are you a wizard?",        variant: "medium" },
  { id: "s2", category: "speed", taskCount: 3, windowMinutes: 1,  emoji: "💨", message: "Three in a minute. The OS salutes you.",   variant: "celebration" },
];

/* ------------------------------------------------------------------ */
/* Streak                                                              */
/* ------------------------------------------------------------------ */

export const STREAK_NUDGES: StreakNudge[] = [
  { id: "st2", category: "streak", streakDays: 2,  emoji: "🔥", message: "Day 2! The streak is alive.",                 variant: "small" },
  { id: "st3", category: "streak", streakDays: 3,  emoji: "🔥", message: "3-day streak! Your ×1.5 XP just kicked in.", variant: "medium" },
  { id: "st5", category: "streak", streakDays: 5,  emoji: "🔥", message: "5 days strong. Habits are forming.",         variant: "medium" },
  { id: "st7", category: "streak", streakDays: 7,  emoji: "🔥", message: "A full week! You're basically a routine now.", variant: "celebration" },
  { id: "st14", category: "streak", streakDays: 14, emoji: "🌋", message: "Two weeks straight. The streak is lava.",     variant: "celebration" },
  { id: "st30", category: "streak", streakDays: 30, emoji: "🏆", message: "30-day streak. Productivity royalty.",        variant: "celebration" },
];

/* ------------------------------------------------------------------ */
/* Variety — mixing tracks                                             */
/* ------------------------------------------------------------------ */

export const VARIETY_NUDGES: VarietyNudge[] = [
  { id: "v1", category: "variety", uniqueRoles: 2, emoji: "🎨", message: "Multitasker! Two different tracks today.",    variant: "small" },
  { id: "v2", category: "variety", uniqueRoles: 3, emoji: "🧠", message: "Three tracks in one session. Polymath mode.", variant: "medium" },
  { id: "v3", category: "variety", uniqueRoles: 4, emoji: "🌈", message: "Four tracks. The OS is impressed.",           variant: "celebration" },
];

/* ------------------------------------------------------------------ */
/* Comeback — after a long break                                       */
/* ------------------------------------------------------------------ */

export const COMEBACK_NUDGES: ComebackNudge[] = [
  { id: "cb1", category: "comeback", hoursSince: 4,  emoji: "👋", message: "Welcome back. Even ten minutes counts.",   variant: "small" },
  { id: "cb2", category: "comeback", hoursSince: 12, emoji: "🌅", message: "Look who's back. The OS missed you.",     variant: "medium" },
  { id: "cb3", category: "comeback", hoursSince: 24, emoji: "🦸", message: "A whole day away and you returned. Hero.", variant: "celebration" },
  { id: "cb4", category: "comeback", hoursSince: 72, emoji: "🪐", message: "Three days later and still here. Legend.", variant: "celebration" },
];

/* ------------------------------------------------------------------ */
/* Level-up flavor                                                     */
/* ------------------------------------------------------------------ */

export const LEVELUP_NUDGES: LevelUpNudge[] = [
  { id: "lu1", category: "levelup", emoji: "🎉", message: "Level up! The bar has been raised.",            variant: "celebration" },
  { id: "lu2", category: "levelup", emoji: "👑", message: "New title unlocked. Wear it well.",            variant: "celebration" },
  { id: "lu3", category: "levelup", emoji: "🚀", message: "Promotion granted. Higher XP, higher you.",   variant: "celebration" },
  { id: "lu4", category: "levelup", emoji: "🪄", message: "XP → level → world domination. Step 2 done.", variant: "celebration" },
];

/* ------------------------------------------------------------------ */
/* Pickers                                                              */
/* ------------------------------------------------------------------ */

const weightedPick = <T extends { weight?: number }>(pool: T[]): T => {
  if (pool.length === 0) throw new Error("Empty nudge pool");
  const total = pool.reduce((s, n) => s + (n.weight ?? 1), 0);
  let r = Math.random() * total;
  for (const item of pool) {
    r -= (item.weight ?? 1);
    if (r <= 0) return item;
  }
  return pool[pool.length - 1];
};

export const pickGeneric = (): GenericNudge => weightedPick(GENERIC_NUDGES);

export const findMilestone = (taskCount: number): MilestoneNudge | null => {
  // exact match (so it doesn't fire twice for the same count)
  return MILESTONE_NUDGES.find((m) => m.taskCount === taskCount) ?? null;
};

export const findCombo = (taskCount: number, windowMinutes: number): ComboNudge | null => {
  return COMBO_NUDGES.find((c) => c.taskCount === taskCount && c.windowMinutes === windowMinutes) ?? null;
};

export const findSpeed = (taskCount: number, windowMinutes: number): SpeedNudge | null => {
  return SPEED_NUDGES.find((s) => s.taskCount === taskCount && s.windowMinutes === windowMinutes) ?? null;
};

export const findStreak = (streakDays: number): StreakNudge | null => {
  // exact match so it fires only the day it hits
  return STREAK_NUDGES.find((s) => s.streakDays === streakDays) ?? null;
};

export const findVariety = (uniqueRoles: number): VarietyNudge | null => {
  return VARIETY_NUDGES.find((v) => v.uniqueRoles === uniqueRoles) ?? null;
};

export const findComeback = (hoursSince: number): ComebackNudge | null => {
  // pick the highest threshold that has been crossed
  const sorted = [...COMEBACK_NUDGES].sort((a, b) => b.hoursSince - a.hoursSince);
  return sorted.find((c) => hoursSince >= c.hoursSince) ?? null;
};

export const findLevelUp = (): LevelUpNudge => weightedPick(LEVELUP_NUDGES);
