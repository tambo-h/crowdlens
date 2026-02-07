/**
 * @file productivity-service.ts
 * @description Service functions for productivity tools using Upstash Redis
 */

"use server";

import { redis } from "@/lib/upstash";
import { z } from "zod";

const HABITS_KEY_PREFIX = "habits:user_1";
const LINKS_KEY_PREFIX = "links:user_1";
const POMODORO_KEY_PREFIX = "pomodoro:user_1";
const DISTRACTIONS_KEY = "distractions:user_1";
const SNIPPETS_KEY = "snippets:user_1";
const STANDUP_KEY = "standup:user_1";
const ENERGY_KEY = "energy:user_1";
const REVIEW_KEY = "review:user_1";
const QUOTES_KEY = "quotes:user_1";

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
export async function getInspirationalQuote(input: { category?: string }) {
  const customQuotes = await redis.get<any[]>(QUOTES_KEY) || [];
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

export async function saveQuote(input: { quote: string, author: string, category: string }) {
  const customQuotes = await redis.get<any[]>(QUOTES_KEY) || [];
  const newQuote = { ...input, id: `q_${Date.now()}` };
  await redis.set(QUOTES_KEY, [newQuote, ...customQuotes]);
  return newQuote;
}

export async function startPomodoroSession(input: any) {
  await redis.incr(`${POMODORO_KEY_PREFIX}:today`);
  return { success: true };
}

export async function logDistraction(input: { description: string, durationMinutes: number, category?: string }) {
  const items = await redis.get<any[]>(DISTRACTIONS_KEY) || [];
  const newItem = { ...input, id: `d_${Date.now()}`, timestamp: new Date().toISOString() };
  await redis.set(DISTRACTIONS_KEY, [newItem, ...items]);
  return newItem;
}

export async function getDistractions(input: any) {
  return await redis.get<any[]>(DISTRACTIONS_KEY) || [];
}

export async function saveSnippet(input: { title: string, code: string, language: string, tags?: string[] }) {
  const items = await redis.get<any[]>(SNIPPETS_KEY) || [];
  const newItem = { ...input, id: `s_${Date.now()}`, savedAt: new Date().toISOString() };
  await redis.set(SNIPPETS_KEY, [newItem, ...items]);
  return newItem;
}

export async function getSnippets(input: any) {
  return await redis.get<any[]>(SNIPPETS_KEY) || [];
}

export async function saveStandupEntry(input: { today: string, yesterday: string, blockers: string }) {
  const items = await redis.get<any[]>(STANDUP_KEY) || [];
  const newItem = { ...input, id: `st_${Date.now()}`, date: new Date().toISOString() };
  await redis.set(STANDUP_KEY, [newItem, ...items]);
  return newItem;
}

export async function getStandupHistory(input: any) {
  return await redis.get<any[]>(STANDUP_KEY) || [];
}

export async function logEnergyLevel(input: { level: number, notes?: string }) {
  const items = await redis.get<any[]>(ENERGY_KEY) || [];
  const newItem = { ...input, id: `e_${Date.now()}`, timestamp: new Date().toISOString() };
  await redis.set(ENERGY_KEY, [newItem, ...items]);
  return newItem;
}

export async function getEnergyData(input: any) {
  return await redis.get<any[]>(ENERGY_KEY) || [];
}

export async function saveWeeklyReview(input: { accomplishments: string, challenges: string, nextWeekGoals: string, rating: number }) {
  const items = await redis.get<any[]>(REVIEW_KEY) || [];
  const newItem = { ...input, id: `w_${Date.now()}`, date: new Date().toISOString() };
  await redis.set(REVIEW_KEY, [newItem, ...items]);
  return newItem;
}

const PRACTICED_RULES_KEY = "practiced_rules:user_1";

export async function getWeeklyReviews(input: any) {
  return await redis.get<any[]>(REVIEW_KEY) || [];
}

export async function getPracticedRules(input: any) {
  return await redis.get<number[]>(PRACTICED_RULES_KEY) || [];
}

export async function togglePracticedRule(input: { ruleId: number }) {
  const practiced = await getPracticedRules({});
  const isPracticed = practiced.includes(input.ruleId);
  const updated = isPracticed
    ? practiced.filter(id => id !== input.ruleId)
    : [...practiced, input.ruleId];

  await redis.set(PRACTICED_RULES_KEY, updated);
  return { success: true, practiced: updated };
}

export async function getPomodoroStats(input: any) {
  const sessions = await redis.get(`${POMODORO_KEY_PREFIX}:today`) || 0;
  return { totalSessions: Number(sessions) };
}

export async function seedProductivityData() {
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

  await redis.set(HABITS_KEY_PREFIX, habits);
  await redis.set(LINKS_KEY_PREFIX, links);
  await redis.del(DISTRACTIONS_KEY);
  await redis.del(SNIPPETS_KEY);
  await redis.del(ENERGY_KEY);
  await redis.del(REVIEW_KEY);
  await redis.del(QUOTES_KEY);

  return { success: true };
}
