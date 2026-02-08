/**
 * @file productivity-service.ts
 * @description Service functions for productivity tools using Upstash Redis with multi-user support
 */

"use server";

import { redis } from "@/lib/upstash";
import { z } from "zod";
import { generatePersonalizedData, generateChallengeDetails } from "./ai-service";

/**
 * Expand a challenge using AI to generate steps and resources
 */
export async function expandChallenge(userId: string, challengeId: string): Promise<any> {
  const keys = getKeys(userId);
  const challenges = await getChallenges(userId);
  const challenge = challenges.find(c => c.id === challengeId);

  if (!challenge) throw new Error("Challenge not found");

  // 1. Generate details via AI
  const expansion = await generateChallengeDetails(challenge.title, challenge.role);

  // 2. Map steps to include IDs
  const steps = expansion.steps.map((s, i) => ({
    id: `s_${Date.now()}_${i}`,
    title: s.title,
    completed: false
  }));

  // 3. Update the challenge in the list
  const updatedChallenges = challenges.map(c =>
    c.id === challengeId ? { ...c, steps, resources: expansion.resources } : c
  );

  await redis.set(keys.skills, updatedChallenges);

  // 4. Sync resources to the global links section
  if (expansion.resources && expansion.resources.length > 0) {
    await batchSaveLinks(userId, expansion.resources);
  }

  return { success: true, steps, resources: expansion.resources };
}

// Helper to get user-specific keys
const getKeys = (userId: string) => ({
  skills: `skills:${userId}`,
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
  setup_draft: `setup_draft:${userId}`,
});

/**
 * Check if a user/PIN already exists in the system
 */
export async function checkUserExistence(userId: string): Promise<boolean> {
  console.log("[Service] Checking existence for user:", userId);
  try {
    const keys = getKeys(userId);
    // If is_seeded or any skills exist, the user exists
    const isSeeded = await redis.get(keys.is_seeded);
    console.log("[Service] isSeeded result:", isSeeded);
    if (isSeeded) return true;

    const challenges = await redis.get(keys.skills);
    console.log("[Service] challenges check result:", !!challenges);
    return !!challenges;
  } catch (error) {
    console.error("[Service] Error in checkUserExistence:", error);
    throw error;
  }
}

export interface ChallengeStep {
  id: string;
  title: string;
  completed: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  steps: ChallengeStep[];
  resources: { title: string; url: string; tags: string[] }[];
  role: string;
  order: number;
  completedAt?: string;
}

/**
 * Get sample productivity data for dashboard
 */
export async function getProductivityDashboard(userId: string): Promise<any> {
  const keys = getKeys(userId);
  const challenges = await getChallenges(userId);
  const sessions = await redis.get(`${keys.pomodoro}:today`) || 0;

  return {
    pomodoroSessionsToday: Number(sessions),
    challengesCompleted: challenges.filter(c => c.completed).length,
    totalChallenges: challenges.length,
    activeRole: challenges.length > 0 ? challenges[0].role : "General",
    recentLinks: await getSavedLinks(userId, { limit: 3 }),
    quote: await getInspirationalQuote(userId, {}),
  };
}

/**
 * Get user's challenges from Redis
 */
export async function getChallenges(userId: string, input: { role?: string } = {}): Promise<Challenge[]> {
  const keys = getKeys(userId);
  const challenges = await redis.get<Challenge[]>(keys.skills) || [];

  if (input.role) return challenges.filter((c) => c.role === input.role);
  return challenges.sort((a, b) => a.order - b.order);
}

/**
 * Toggle challenge completion or step completion
 */
export async function toggleChallenge(userId: string, input: { challengeId: string, completed?: boolean, stepId?: string }): Promise<any> {
  const keys = getKeys(userId);
  const challenges = await getChallenges(userId);
  const updated = challenges.map(c => {
    if (c.id === input.challengeId) {
      if (input.stepId) {
        const updatedSteps = c.steps.map(s => s.id === input.stepId ? { ...s, completed: !s.completed } : s);
        const allDone = updatedSteps.every(s => s.completed);
        return { ...c, steps: updatedSteps, completed: allDone, completedAt: allDone ? new Date().toISOString() : undefined };
      }
      return {
        ...c,
        completed: input.completed ?? !c.completed,
        completedAt: (input.completed ?? !c.completed) ? new Date().toISOString() : undefined,
        steps: c.steps.map(s => ({ ...s, completed: input.completed ?? !c.completed }))
      };
    }
    return c;
  });

  await redis.set(keys.skills, updated);
  return { success: true };
}

/**
 * Save new challenge (Can be called by user or AI)
 */
export async function saveChallenge(userId: string, challenge: Omit<Challenge, "id">): Promise<Challenge> {
  const keys = getKeys(userId);
  const challenges = await getChallenges(userId);
  const newChallenge: Challenge = {
    ...challenge,
    id: `c_${Date.now()}`,
    completed: false,
    steps: challenge.steps || [],
    resources: challenge.resources || [],
    order: challenge.order ?? challenges.length
  };
  await redis.set(keys.skills, [newChallenge, ...challenges]);
  return newChallenge;
}

/**
 * Bulk save challenges (called by AI onboarding)
 */
export async function batchSaveChallenges(userId: string, challengesToSave: Omit<Challenge, "id">[] = []): Promise<any> {
  const keys = getKeys(userId);
  const existing = await getChallenges(userId);
  const newChallenges: Challenge[] = (challengesToSave || []).map((c, i) => ({
    ...c,
    id: `ac_${Date.now()}_${i}`,
    completed: false,
    steps: c.steps || [],
    resources: c.resources || [],
    order: existing.length + i
  }));
  await redis.set(keys.skills, [...newChallenges, ...existing]);
  return { success: true, count: newChallenges.length };
}

/**
 * Get saved links
 */
/**
 * Delete a challenge
 */
export async function deleteChallenge(userId: string, challengeId: string): Promise<any> {
  const keys = getKeys(userId);
  const challenges = await getChallenges(userId);
  const filtered = challenges.filter(c => c.id !== challengeId);
  await redis.set(keys.skills, filtered);
  return { success: true };
}

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

export async function updateLink(userId: string, linkId: string, input: any): Promise<any> {
  const keys = getKeys(userId);
  const links = await getSavedLinks(userId);
  const updated = links.map(l => l.id === linkId ? { ...l, ...input } : l);
  await redis.set(keys.links, updated);
  return { success: true };
}

export async function deleteLink(userId: string, linkId: string): Promise<any> {
  const keys = getKeys(userId);
  const links = await getSavedLinks(userId);
  const filtered = links.filter(l => l.id !== linkId);
  await redis.set(keys.links, filtered);
  return { success: true };
}

/**
 * Bulk save links (called by AI onboarding)
 */
export async function batchSaveLinks(userId: string, linksToSave: { title: string, url: string, tags: string[] }[] = []): Promise<any> {
  const keys = getKeys(userId);
  const existing = await getSavedLinks(userId);
  const newLinks = (linksToSave || []).map((l, i) => ({
    ...l,
    tags: l.tags || [],
    id: `al_${Date.now()}_${i}`,
    savedAt: new Date().toISOString()
  }));
  await redis.set(keys.links, [...newLinks, ...existing]);
  return { success: true, count: newLinks.length };
}

export async function getInspirationalQuote(userId: string, input: { category?: string } = {}) {
  const keys = getKeys(userId);
  const customQuotes = await redis.get<any[]>(keys.quotes) || [];
  const defaultQuotes = [
    { text: "The best way to predict the future is to invent it.", author: "Alan Kay", category: "productivity" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "productivity" },
    { text: "Focus on being productive instead of busy.", author: "Tim Ferriss", category: "productivity" },
    { text: "It’s not at all that I’m so smart, it’s just that I stay with problems longer.", author: "Albert Einstein", category: "motivation" },
    { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein", category: "motivation" }
  ];

  const pool = input?.category === "custom" ? customQuotes : [...defaultQuotes, ...customQuotes];
  if (pool.length === 0) return defaultQuotes[0];

  const filtered = input?.category && input.category !== "custom"
    ? pool.filter(q => q.category === input.category)
    : pool;

  const finalPool = filtered.length > 0 ? filtered : pool;
  const selected = finalPool[Math.floor(Math.random() * finalPool.length)];
  return {
    text: selected.text || (selected as any).quote,
    author: selected.author,
    category: selected.category
  };
}

export async function saveQuote(userId: string, input: { text: string, author: string, category: string }) {
  const keys = getKeys(userId);
  const customQuotes = await redis.get<any[]>(keys.quotes) || [];
  const newQuote = { ...input, id: `q_${Date.now()}` };
  await redis.set(keys.quotes, [newQuote, ...customQuotes]);
  return newQuote;
}

export async function updateQuote(userId: string, quoteId: string, input: any) {
  const keys = getKeys(userId);
  const items = await redis.get<any[]>(keys.quotes) || [];
  const updated = items.map(i => i.id === quoteId ? { ...i, ...input } : i);
  await redis.set(keys.quotes, updated);
  return { success: true };
}

export async function deleteQuote(userId: string, quoteId: string) {
  const keys = getKeys(userId);
  const items = await redis.get<any[]>(keys.quotes) || [];
  const filtered = items.filter(i => i.id !== quoteId);
  await redis.set(keys.quotes, filtered);
  return { success: true };
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

export async function updateSnippet(userId: string, snippetId: string, input: any) {
  const keys = getKeys(userId);
  const items = await getSnippets(userId);
  const updated = items.map(i => i.id === snippetId ? { ...i, ...input } : i);
  await redis.set(keys.snippets, updated);
  return { success: true };
}

export async function deleteSnippet(userId: string, snippetId: string) {
  const keys = getKeys(userId);
  const items = await getSnippets(userId);
  const filtered = items.filter(i => i.id !== snippetId);
  await redis.set(keys.snippets, filtered);
  return { success: true };
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

/**
 * Overwrite deep work rules (called by AI onboarding)
 */
export async function applyAIPracticedRules(userId: string, rules: string[]): Promise<any> {
  // For simplicity, we'll store AI-generated rule names in a special key or just use context later
  // Current app uses numeric IDs for static rules. We'll stick to habits/links for now or enhance rules later.
  return { success: true };
}

/**
 * AI-Driven Workspace Setup
 */
export async function setupPersonalizedWorkspace(userId: string, input: { skill: string, confirm?: boolean, data?: any }) {
  const keys = getKeys(userId);

  if (!input.confirm) {
    console.log("[Productivity-Service] Starting AI setup for skill:", input.skill);
    const generated = await generatePersonalizedData(input.skill);
    const habitNames = generated.habits.map(h => h.name).join(", ");

    // Store draft in Redis temporarily (expiring in 30 minutes)
    await redis.set(keys.setup_draft, generated, { ex: 1800 });
    console.log("[Productivity-Service] Draft stored in Redis for user:", userId);

    return {
      message: `I've prepared a personalized setup for a ${input.skill}. Here's a preview:\n\n**Habits**: ${habitNames}\n\n**Resources**: ${generated.links.length} curated links.\n\nShould I apply these to your workspace?`,
      elicitation: {
        title: "Confirm Workspace Setup",
        fields: [
          { name: "confirm", type: "boolean", label: "Apply these habits and resources?", required: true }
        ]
      }
    };
  }

  console.log("[Productivity-Service] Confirming setup for user:", userId);

  // Retrieve from Redis
  const draft = await redis.get<any>(keys.setup_draft);
  if (!draft) {
    console.error("[Productivity-Service] No draft found in Redis for user:", userId);
    return {
      success: false,
      message: "Setup failed: The session expired or the data was lost. Please try describing your role again."
    };
  }

  const challenges = draft.habits || [];
  const links = draft.links || [];
  console.log("[Productivity-Service] Applying setup from draft - Challenges:", challenges.length, "Links:", links.length);

  await batchSaveChallenges(userId, challenges.map((h: any, i: number) => ({
    title: h.name,
    completed: false,
    steps: [],
    resources: [],
    role: input.skill,
    order: i
  })));
  await batchSaveLinks(userId, links);

  // Cleanup
  await redis.del(keys.setup_draft);

  return {
    success: true,
    message: `Awesome! Your workspace is now optimized for a ${input.skill}. Your new skills and resources have been added.`
  };
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

  // minimal initial energy data for dashboard to look alive
  const energyEntries = Array.from({ length: 5 }, (_, i) => {
    const date = new Date();
    date.setHours(date.getHours() - (4 - i));
    const levels = [7, 8, 4, 3, 6];
    return {
      id: `e_seed_${i}`,
      level: levels[i],
      notes: "System initialization",
      timestamp: date.toISOString()
    };
  });

  await redis.set(keys.energy, energyEntries);
  await redis.set(keys.is_seeded, true);

  // Clear others for fresh user
  await redis.del(keys.skills);
  await redis.del(keys.links);
  await redis.del(keys.distractions);
  await redis.del(keys.snippets);
  await redis.del(keys.standup);
  await redis.del(keys.review);
  await redis.del(keys.quotes);
  await redis.del(keys.practiced_rules);

  return { success: true };
}
