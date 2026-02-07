/**
 * @file productivity-service.ts
 * @description Service functions for productivity tools using Upstash Redis
 */

import { redis } from "@/lib/upstash";
import { z } from "zod";

const HABITS_KEY_PREFIX = "habits:user_1";
const LINKS_KEY_PREFIX = "links:user_1";
const POMODORO_KEY_PREFIX = "pomodoro:user_1";

export interface Habit {
  id: string;
  name: string;
  category: "Code" | "Learn" | "Health" | "Review";
  streak: number;
  completedToday: boolean;
  lastCompletedAt?: string;
}

/**
 * Get sample productivity data for dashboard
 */
export async function getProductivityDashboard(input: {
  userId?: string;
}): Promise<any> {
  const habits = await getHabits({});
  const sessions = await redis.get(`${POMODORO_KEY_PREFIX}:today`) || 0;

  return {
    pomodoroSessionsToday: Number(sessions),
    habitsCompletedToday: habits.filter(h => h.completedToday).length,
    totalHabits: habits.length,
    currentStreak: habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0,
    recentLinks: await getSavedLinks({ limit: 3 }),
    quote: {
      text: "The best way to predict the future is to invent it.",
      author: "Alan Kay",
    },
  };
}

/**
 * Get user's habits from Redis
 */
export async function getHabits(input: {
  userId?: string;
  category?: string;
}): Promise<Habit[]> {
  const data = await redis.get<Habit[]>(HABITS_KEY_PREFIX);
  const habits = data || [
    { id: "1", name: "Morning Code Review", category: "Code", streak: 12, completedToday: true },
    { id: "2", name: "Read Tech Articles", category: "Learn", streak: 8, completedToday: true },
    { id: "3", name: "30min Exercise", category: "Health", streak: 5, completedToday: false },
    { id: "4", name: "Daily Standup Log", category: "Review", streak: 15, completedToday: false },
  ];

  if (input.category) return habits.filter((h) => h.category === input.category);
  return habits;
}

/**
 * Toggle habit completion and persist to Redis
 */
export async function toggleHabit(input: { habitId: string, completed: boolean }): Promise<any> {
  const habits = await getHabits({});
  const updatedHabits = habits.map(h => {
    if (h.id === input.habitId) {
      const newStreak = input.completed ? h.streak + 1 : Math.max(0, h.streak - 1);
      return {
        ...h,
        completedToday: input.completed,
        streak: newStreak,
        lastCompletedAt: input.completed ? new Date().toISOString() : h.lastCompletedAt
      };
    }
    return h;
  });

  await redis.set(HABITS_KEY_PREFIX, updatedHabits);
  return { success: true };
}

/**
 * Save new habit (called by AI)
 */
export async function saveHabit(habit: Omit<Habit, "id" | "streak" | "completedToday">): Promise<Habit> {
  const habits = await getHabits({});
  const newHabit: Habit = {
    ...habit,
    id: `h_${Date.now()}`,
    streak: 0,
    completedToday: false
  };
  await redis.set(HABITS_KEY_PREFIX, [newHabit, ...habits]);
  return newHabit;
}

/**
 * Get saved links
 */
export async function getSavedLinks(input: { limit?: number }): Promise<any[]> {
  const links = await redis.get<any[]>(LINKS_KEY_PREFIX) || [];
  return links.slice(0, input.limit || 10);
}

/**
 * Save a new link
 */
export async function saveLink(input: { url: string, title: string, tags: string[], notes?: string }): Promise<any> {
  const links = await redis.get<any[]>(LINKS_KEY_PREFIX) || [];
  const newLink = { ...input, id: `l_${Date.now()}`, savedAt: new Date().toISOString() };
  await redis.set(LINKS_KEY_PREFIX, [newLink, ...links]);
  return newLink;
}

// ... rest of the services will be updated to use Redis as we implement sync for them
export async function getInspirationalQuote(input: any) {
  return { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "productivity" };
}

export async function startPomodoroSession(input: any) {
  await redis.incr(`${POMODORO_KEY_PREFIX}:today`);
  return { success: true };
}

export async function logDistraction(input: any) { return { id: `d_${Date.now()}`, timestamp: new Date().toISOString() }; }
export async function getDistractions(input: any) { return []; }
export async function saveSnippet(input: any) { return { id: `s_${Date.now()}`, savedAt: new Date().toISOString() }; }
export async function getSnippets(input: any) { return []; }
export async function saveStandupEntry(input: any) { return { id: `st_${Date.now()}`, date: new Date().toISOString() }; }
export async function getStandupHistory(input: any) { return []; }
export async function logEnergyLevel(input: any) { return { id: `e_${Date.now()}`, timestamp: new Date().toISOString() }; }
export async function getEnergyData(input: any) { return []; }
export async function saveWeeklyReview(input: any) { return { id: `w_${Date.now()}`, date: new Date().toISOString() }; }
export async function getWeeklyReviews(input: any) { return []; }
export async function getPomodoroStats(input: any) { return { totalSessions: 0 }; }
