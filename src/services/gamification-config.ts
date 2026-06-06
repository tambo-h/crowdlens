/**
 * @file gamification-config.ts
 * @description Pure config + helpers for the gamification system.
 * No server actions here — safe to import from client components.
 */

export interface LevelDef {
  level: number;
  title: string;
  emoji: string;
  threshold: number;
  blurb: string;
}

export const LEVELS: LevelDef[] = [
  { level: 1,  title: "Sleepy Intern",          emoji: "🥱", threshold: 0,     blurb: "You opened a tab. That's something." },
  { level: 2,  title: "Caffeinated Noob",       emoji: "☕", threshold: 50,    blurb: "Coffee in, productivity… pending." },
  { level: 3,  title: "Task Tinkerer",          emoji: "🛠️", threshold: 150,   blurb: "You make lists. Now you have lists of lists." },
  { level: 4,  title: "Productivity Padawan",   emoji: "🌱", threshold: 350,   blurb: "Yoda thinks you have potential." },
  { level: 5,  title: "Focus Ninja",            emoji: "🥷", threshold: 700,   blurb: "Notifications fear you." },
  { level: 6,  title: "Deadline Dominator",     emoji: "📅", threshold: 1200,  blurb: "Calendars are just suggestion boxes to you." },
  { level: 7,  title: "Deep Work Demon",        emoji: "😈", threshold: 1900,  blurb: "You sleep in flow state." },
  { level: 8,  title: "Async Overlord",         emoji: "👑", threshold: 2800,  blurb: "Meetings ask permission first." },
  { level: 9,  title: "Output Overachiever",    emoji: "🚀", threshold: 4000,  blurb: "Outputs > inputs. Always." },
  { level: 10, title: "Productivity Wizard",    emoji: "🧙", threshold: 5500,  blurb: "Pure magic. Slight smell of ozone." },
  { level: 11, title: "Execution Machine",      emoji: "⚙️", threshold: 7500,  blurb: "Tireless. Slightly terrifying." },
  { level: 12, title: "Productivity Grandmaster", emoji: "🏆", threshold: 10000, blurb: "Your keyboard files for workers' comp." },
  { level: 13, title: "Productivity Master",    emoji: "👑", threshold: 15000, blurb: "Final boss. The OS now asks YOU for advice." },
];

export type XPAction =
  | "challenge_step_complete"
  | "challenge_complete"
  | "pomodoro_start"
  | "pomodoro_complete"
  | "link_saved"
  | "snippet_saved"
  | "standup_logged"
  | "energy_logged"
  | "weekly_review"
  | "rule_practiced"
  | "distraction_logged"
  | "quote_saved"
  | "track_setup"
  | "daily_first_action";

export const XP_VALUES: Record<XPAction, number> = {
  challenge_step_complete: 5,
  challenge_complete: 50,
  pomodoro_start: 10,
  pomodoro_complete: 25,
  link_saved: 2,
  snippet_saved: 5,
  standup_logged: 10,
  energy_logged: 5,
  weekly_review: 25,
  rule_practiced: 15,
  distraction_logged: 1,
  quote_saved: 3,
  track_setup: 75,
  daily_first_action: 5,
};

export const XP_ACTION_LABELS: Record<XPAction, string> = {
  challenge_step_complete: "Crushed a step",
  challenge_complete: "Finished a challenge",
  pomodoro_start: "Started a focus session",
  pomodoro_complete: "Completed a focus session",
  link_saved: "Saved a resource",
  snippet_saved: "Saved a snippet",
  standup_logged: "Logged your standup",
  energy_logged: "Checked in on energy",
  weekly_review: "Wrote a weekly review",
  rule_practiced: "Practiced a principle",
  distraction_logged: "Logged a distraction",
  quote_saved: "Saved a quote",
  track_setup: "Set up a new track",
  daily_first_action: "First action of the day",
};

export interface Achievement {
  id: string;
  title: string;
  emoji: string;
  description: string;
  bonus: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_blood",   title: "First Blood",        emoji: "🎯", description: "Complete your very first task.",      bonus: 25 },
  { id: "streak_3",      title: "3-Day Streak",       emoji: "🔥", description: "Show up three days in a row.",        bonus: 30 },
  { id: "streak_7",      title: "Weekly Warrior",     emoji: "⚔️", description: "A whole week of action.",             bonus: 75 },
  { id: "pomo_10",       title: "Pomodoro Apprentice",emoji: "🍅", description: "Finish 10 focus sessions.",           bonus: 50 },
  { id: "pomo_50",       title: "Pomodoro Sensei",    emoji: "🥋", description: "Finish 50 focus sessions.",           bonus: 150 },
  { id: "track_master",  title: "Track Master",       emoji: "🗺️", description: "Complete a full skill track.",        bonus: 100 },
  { id: "polymath",      title: "Polymath",           emoji: "🧠", description: "Stay active in 3+ different roles.",  bonus: 75 },
  { id: "early_bird",    title: "Early Bird",         emoji: "🌅", description: "Act before 7am.",                     bonus: 25 },
  { id: "night_owl",     title: "Night Owl",          emoji: "🌙", description: "Act after 11pm.",                    bonus: 25 },
  { id: "centurion",     title: "Centurion",          emoji: "💯", description: "Reach 100 total XP.",                bonus: 20 },
];

export function getLevelForXP(xp: number): LevelDef {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.threshold) current = lvl;
  }
  return current;
}

export function getNextLevel(xp: number): LevelDef | null {
  return LEVELS.find((l) => l.threshold > xp) || null;
}

export function getLevelProgress(xp: number) {
  const level = getLevelForXP(xp);
  const next = getNextLevel(xp);
  if (!next) {
    return { level, next, xpInCurrentLevel: 0, xpForNextLevel: 0, xpToNextLevel: 0, progressPercent: 100 };
  }
  const xpInCurrentLevel = xp - level.threshold;
  const xpForNextLevel = next.threshold - level.threshold;
  const xpToNextLevel = next.threshold - xp;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpForNextLevel) * 100));
  return { level, next, xpInCurrentLevel, xpForNextLevel, xpToNextLevel, progressPercent };
}
