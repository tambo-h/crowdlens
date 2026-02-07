/**
 * @file productivity-service.ts
 * @description Service functions for productivity tools using Upstash Redis with multi-user support
 */

"use server";

import { redis } from "@/lib/upstash";
import { z } from "zod";

// Helper to get user-specific keys
const getKeys = (userId: string) => ({
  habits: `habits:${userId}`,
  links: `links:${userId}`,
  pomodoro: `pomodoro:${userId}`,
  distractions: `distractions:${userId}`,
  snippets: `snippets:${userId}`,
  standup: `standup:${userId}`,
  energy: `energy:${userId}`,
  review: `review:${userId}`,
  quotes: `quotes:${userId}`,
  practiced_rules: `practiced_rules:${userId}`,
  is_seeded: `is_seeded:${userId}`,
});

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
export async function getProductivityDashboard(userId: string): Promise<any> {
  const keys = getKeys(userId);
  const habits = await getHabits(userId);
  const sessions = await redis.get(`${keys.pomodoro}:today`) || 0;

  return {
    pomodoroSessionsToday: Number(sessions),
    habitsCompletedToday: habits.filter(h => h.completedToday).length,
    totalHabits: habits.length,
    currentStreak: habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0,
    recentLinks: await getSavedLinks(userId, { limit: 3 }),
    quote: await getInspirationalQuote(userId, {}),
  };
}

/**
 * Get user's habits from Redis
 */
export async function getHabits(userId: string, input: { category?: string } = {}): Promise<Habit[]> {
  const keys = getKeys(userId);
  const habits = await redis.get<Habit[]>(keys.habits) || [];

  if (input.category) return habits.filter((h) => h.category === input.category);
  return habits;
}

/**
 * Toggle habit completion and persist to Redis
 */
export async function toggleHabit(userId: string, input: { habitId: string, completed: boolean }): Promise<any> {
  const keys = getKeys(userId);
  const habits = await getHabits(userId);
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

  await redis.set(keys.habits, updatedHabits);
  return { success: true };
}

/**
 * Save new habit (called by AI)
 */
export async function saveHabit(userId: string, habit: Omit<Habit, "id" | "streak" | "completedToday">): Promise<Habit> {
  const keys = getKeys(userId);
  const habits = await getHabits(userId);
  const newHabit: Habit = {
    ...habit,
    id: `h_${Date.now()}`,
    streak: 0,
    completedToday: false
  };
  await redis.set(keys.habits, [newHabit, ...habits]);
  return newHabit;
}

/**
 * Get saved links
 */
export async function getSavedLinks(userId: string, input: { limit?: number } = {}): Promise<any[]> {
  const keys = getKeys(userId);
  const links = await redis.get<any[]>(keys.links) || [];
  return links.slice(0, input.limit || 10);
}

/**
 * Save a new link
 */
export async function saveLink(userId: string, input: { url: string, title: string, tags: string[], notes?: string }): Promise<any> {
  const keys = getKeys(userId);
  const links = await redis.get<any[]>(keys.links) || [];
  const newLink = { ...input, id: `l_${Date.now()}`, savedAt: new Date().toISOString() };
  await redis.set(keys.links, [newLink, ...links]);
  return newLink;
}

export async function getInspirationalQuote(userId: string, input: { category?: string } = {}) {
  const keys = getKeys(userId);
  const customQuotes = await redis.get<any[]>(keys.quotes) || [];
  const defaultQuotes = [
    { quote: "The best way to predict the future is to invent it.", author: "Alan Kay", category: "productivity" },
    { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "productivity" },
    { quote: "Focus on being productive instead of busy.", author: "Tim Ferriss", category: "productivity" },
    { quote: "It’s not at all that I’m so smart, it’s just that I stay with problems longer.", author: "Albert Einstein", category: "motivation" },
    { quote: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein", category: "motivation" }
  ];

  const pool = input?.category === "custom" ? customQuotes : [...defaultQuotes, ...customQuotes];
  if (pool.length === 0) return defaultQuotes[0];

  const filtered = input?.category && input.category !== "custom"
    ? pool.filter(q => q.category === input.category)
    : pool;

  const finalPool = filtered.length > 0 ? filtered : pool;
  return finalPool[Math.floor(Math.random() * finalPool.length)];
}

export async function saveQuote(userId: string, input: { quote: string, author: string, category: string }) {
  const keys = getKeys(userId);
  const customQuotes = await redis.get<any[]>(keys.quotes) || [];
  const newQuote = { ...input, id: `q_${Date.now()}` };
  await redis.set(keys.quotes, [newQuote, ...customQuotes]);
  return newQuote;
}

export async function startPomodoroSession(userId: string, input: any = {}) {
  const keys = getKeys(userId);
  await redis.incr(`${keys.pomodoro}:today`);
  return { success: true };
}

export async function logDistraction(userId: string, input: { description: string, durationMinutes: number, category?: string }) {
  const keys = getKeys(userId);
  const items = await redis.get<any[]>(keys.distractions) || [];
  const newItem = { ...input, id: `d_${Date.now()}`, timestamp: new Date().toISOString() };
  await redis.set(keys.distractions, [newItem, ...items]);
  return newItem;
}

export async function getDistractions(userId: string, input: any = {}) {
  const keys = getKeys(userId);
  return await redis.get<any[]>(keys.distractions) || [];
}

export async function saveSnippet(userId: string, input: { title: string, code: string, language: string, tags?: string[] }) {
  const keys = getKeys(userId);
  const items = await redis.get<any[]>(keys.snippets) || [];
  const newItem = { ...input, id: `s_${Date.now()}`, savedAt: new Date().toISOString() };
  await redis.set(keys.snippets, [newItem, ...items]);
  return newItem;
}

export async function getSnippets(userId: string, input: any = {}) {
  const keys = getKeys(userId);
  return await redis.get<any[]>(keys.snippets) || [];
}

export async function saveStandupEntry(userId: string, input: { today: string, yesterday: string, blockers: string }) {
  const keys = getKeys(userId);
  const items = await redis.get<any[]>(keys.standup) || [];
  const newItem = { ...input, id: `st_${Date.now()}`, date: new Date().toISOString() };
  await redis.set(keys.standup, [newItem, ...items]);
  return newItem;
}

export async function getStandupHistory(userId: string, input: any = {}) {
  const keys = getKeys(userId);
  return await redis.get<any[]>(keys.standup) || [];
}

export async function logEnergyLevel(userId: string, input: { level: number, notes?: string }) {
  const keys = getKeys(userId);
  const items = await redis.get<any[]>(keys.energy) || [];
  const newItem = { ...input, id: `e_${Date.now()}`, timestamp: new Date().toISOString() };
  await redis.set(keys.energy, [newItem, ...items]);
  return newItem;
}

export async function getEnergyData(userId: string, input: any = {}) {
  const keys = getKeys(userId);
  return await redis.get<any[]>(keys.energy) || [];
}

export async function saveWeeklyReview(userId: string, input: { accomplishments: string, challenges: string, nextWeekGoals: string, rating: number }) {
  const keys = getKeys(userId);
  const items = await redis.get<any[]>(keys.review) || [];
  const newItem = { ...input, id: `w_${Date.now()}`, date: new Date().toISOString() };
  await redis.set(keys.review, [newItem, ...items]);
  return newItem;
}

export async function getWeeklyReviews(userId: string, input: any = {}) {
  const keys = getKeys(userId);
  return await redis.get<any[]>(keys.review) || [];
}

export async function getPracticedRules(userId: string, input: any = {}) {
  const keys = getKeys(userId);
  return await redis.get<number[]>(keys.practiced_rules) || [];
}

export async function togglePracticedRule(userId: string, input: { ruleId: number }) {
  const keys = getKeys(userId);
  const practiced = await getPracticedRules(userId);
  const isPracticed = practiced.includes(input.ruleId);
  const updated = isPracticed
    ? practiced.filter(id => id !== input.ruleId)
    : [...practiced, input.ruleId];

  await redis.set(keys.practiced_rules, updated);
  return { success: true, practiced: updated };
}

export async function getPomodoroStats(userId: string, input: any = {}) {
  const keys = getKeys(userId);
  const sessions = await redis.get(`${keys.pomodoro}:today`) || 0;
  return { totalSessions: Number(sessions) };
}

export async function seedProductivityData(userId: string) {
  const keys = getKeys(userId);

  // Check if already seeded to prevent overwriting user work
  const isSeeded = await redis.get(keys.is_seeded);
  if (isSeeded) return { success: true, alreadySeeded: true };

  const habits: Habit[] = [
    { id: "h1", name: "Deep Work (2h)", category: "Code", streak: 5, completedToday: false },
    { id: "h2", name: "Read Technical Book", category: "Learn", streak: 3, completedToday: false },
    { id: "h3", name: "Morning Run", category: "Health", streak: 7, completedToday: false },
    { id: "h4", name: "Plan Tomorrow", category: "Review", streak: 10, completedToday: false },
    { id: "h5", name: "Review Code Snippets", category: "Code", streak: 2, completedToday: false }
  ];

  const links = [
    { id: "l1", title: "Next.js Documentation", url: "https://nextjs.org/docs", tags: ["dev", "nextjs"], savedAt: new Date().toISOString() },
    { id: "l2", title: "Upstash Redis", url: "https://upstash.com", tags: ["db", "redis"], savedAt: new Date().toISOString() }
  ];

  await redis.set(keys.habits, habits);
  await redis.set(keys.links, links);
  await redis.set(keys.is_seeded, true);

  // Clear others for fresh user
  await redis.del(keys.distractions);
  await redis.del(keys.snippets);
  await redis.del(keys.energy);
  await redis.del(keys.review);
  await redis.del(keys.quotes);
  await redis.del(keys.practiced_rules);

  return { success: true };
}
