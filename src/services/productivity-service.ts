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
 * Normalizes arguments for functions that can be called either as:
 * 1. (userId: string, input: T)
 * 2. (input: T & { userId: string }) 
 */
function normalizeArgs<T>(arg1: any, arg2?: T): { userId: string, input: T } {
  if (typeof arg1 === 'object' && arg1 !== null) {
    // Case 2: (input: T & { userId: string })
    const { userId, ...input } = arg1;
    return { userId: userId || (arg1 as any).id, input: input as T };
  }
  // Case 1: (userId: string, input: T)
  return { userId: arg1, input: arg2 as T };
}

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
  const { userId: actualUserId } = normalizeArgs(userId, {});
  const keys = getKeys(actualUserId);
  const challenges = await getChallenges(actualUserId);
  const sessions = await redis.get(`${keys.pomodoro}:today`) || 0;
  const energyData = await getEnergyData(actualUserId);
  const currentEnergy = energyData.length > 0 ? energyData[energyData.length - 1].level : null;

  return {
    pomodoroSessionsToday: Number(sessions),
    challengesCompletedToday: challenges.filter(c => c.completed).length,
    totalChallenges: challenges.length,
    activeRole: challenges.length > 0 ? challenges[0].role : "General",
    recentLinks: await getSavedLinks(actualUserId, { limit: 3 }),
    quote: await getInspirationalQuote(actualUserId, {}),
    currentEnergy
  };
}

/**
 * Get user's challenges from Redis
 */
export async function getChallenges(userId: string, input: { role?: string } = {}): Promise<Challenge[]> {
  const { userId: actualUserId, input: actualInput } = normalizeArgs(userId, input);
  const keys = getKeys(actualUserId);
  const challenges = await redis.get<Challenge[]>(keys.skills) || [];

  if (actualInput?.role) return challenges.filter((c) => c.role === actualInput.role);
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
 * Add a new step to a challenge
 */
export async function addChallengeStep(userId: string, input: { challengeId: string, title: string }): Promise<any> {
  const keys = getKeys(userId);
  const challenges = await getChallenges(userId);
  const updated = challenges.map(c => {
    if (c.id === input.challengeId) {
      const newStep: ChallengeStep = {
        id: `s_${Date.now()}`,
        title: input.title,
        completed: false
      };
      return { ...c, steps: [...c.steps, newStep], completed: false };
    }
    return c;
  });

  await redis.set(keys.skills, updated);
  return { success: true };
}

/**
 * Update a specific step's title
 */
export async function updateChallengeStep(userId: string, input: { challengeId: string, stepId: string, title: string }): Promise<any> {
  const keys = getKeys(userId);
  const challenges = await getChallenges(userId);
  const updated = challenges.map(c => {
    if (c.id === input.challengeId) {
      const updatedSteps = c.steps.map(s => s.id === input.stepId ? { ...s, title: input.title } : s);
      return { ...c, steps: updatedSteps };
    }
    return c;
  });

  await redis.set(keys.skills, updated);
  return { success: true };
}

/**
 * Delete a specific step from a challenge
 */
export async function deleteChallengeStep(userId: string, input: { challengeId: string, stepId: string }): Promise<any> {
  const keys = getKeys(userId);
  const challenges = await getChallenges(userId);
  const updated = challenges.map(c => {
    if (c.id === input.challengeId) {
      const filteredSteps = c.steps.filter(s => s.id !== input.stepId);
      const allDone = filteredSteps.length > 0 && filteredSteps.every(s => s.completed);
      return { ...c, steps: filteredSteps, completed: allDone };
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
  const { userId: actualUserId, input: actualChallenge } = normalizeArgs(userId, challenge);
  const keys = getKeys(actualUserId);
  const challenges = await getChallenges(actualUserId);
  const newChallenge: Challenge = {
    ...actualChallenge,
    id: `c_${Date.now()}`,
    completed: false,
    steps: actualChallenge.steps || [],
    resources: actualChallenge.resources || [],
    order: actualChallenge.order ?? challenges.length
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

export async function updateChallenge(userId: string, input: { challengeId: string, updates: Partial<Challenge> }): Promise<any> {
  const { userId: actualUserId, input: actualInput } = normalizeArgs(userId, input);
  const keys = getKeys(actualUserId);
  const challenges = await getChallenges(actualUserId);
  const updated = challenges.map(c =>
    c.id === actualInput.challengeId ? { ...c, ...actualInput.updates } : c
  );
  await redis.set(keys.skills, updated);
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
  const { userId: actualUserId, input: actualInput } = normalizeArgs(userId, input);
  const keys = getKeys(actualUserId);
  const items = await redis.get<any[]>(keys.energy) || [];
  const newItem = { ...actualInput, id: `e_${Date.now()}`, timestamp: new Date().toISOString() };
  await redis.set(keys.energy, [newItem, ...items]);
  return newItem;
}

export async function getEnergyData(userId: string, input: any = {}) {
  const { userId: actualUserId } = normalizeArgs(userId, input);
  const keys = getKeys(actualUserId);
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
export async function setupPersonalizedWorkspace(userId: string, input: { skill: string, experienceLevel?: string, projectType?: string, confirm?: boolean, data?: any }) {
  console.log("[Service] setupPersonalizedWorkspace CALLED");
  const { userId: actualUserId, input: actualInput } = normalizeArgs(userId, input);
  console.log("[Service] normalized userId:", actualUserId, "normalized input:", actualInput);

  if (!actualUserId) {
    console.error("[Service] Missing userId in setupPersonalizedWorkspace");
    return {
      success: false,
      message: "Security error: Workspace PIN missing. Please enter your PIN to continue."
    };
  }

  const keys = getKeys(actualUserId);

  if (!actualInput.confirm) {
    console.log("[Productivity-Service] Starting AI setup for skill:", actualInput.skill, "Level:", actualInput.experienceLevel);
    try {
      const generated = await generatePersonalizedData(
        actualInput.skill,
        actualInput.experienceLevel,
        actualInput.projectType
      );

      // Store draft in Redis temporarily (expiring in 30 minutes)
      await redis.set(keys.setup_draft, generated, { ex: 1800 });
      console.log("[Productivity-Service] Draft stored in Redis for user:", actualUserId);

      const habitList = (generated.habits || []).map(h => `- **${h.name}**`).slice(0, 5).join("\n");
      const linkList = (generated.links || []).map(l => `- [${l.title}](${l.url})`).slice(0, 3).join("\n");

      return {
        message: `I've prepared a personalized setup for a ${actualInput.experienceLevel || ""} ${actualInput.skill}${actualInput.projectType ? ` building a ${actualInput.projectType}` : ""}.\n\n### Preview:\n${habitList}\n${(generated.habits?.length || 0) > 5 ? `*+ ${generated.habits.length - 5} more challenges*\n` : ""}\n\n### Resources:\n${linkList}\n\nShould I apply these to your workspace?\n\n> 💡 **Action Required**: Respond with **"apply"** or click the **"Apply Setup Now"** button above to finalize your workspace.`,
        suggestions: ["apply"],
        interactive: {
          name: "WorkspacePreview",
          props: {
            role: actualInput.skill,
            habits: generated.habits || [],
            links: generated.links || [],
            rules: generated.rules || []
          }
        },
        render: {
          name: "WorkspacePreview",
          props: {
            role: actualInput.skill,
            habits: generated.habits || [],
            links: generated.links || [],
            rules: generated.rules || []
          }
        },
        component: {
          name: "WorkspacePreview",
          props: {
            role: actualInput.skill,
            habits: generated.habits || [],
            links: generated.links || [],
            rules: generated.rules || []
          }
        }
      };
    } catch (error: any) {
      console.error("[Productivity-Service] AI Setup failed:", error);
      return {
        success: false,
        message: `### ❌ AI Generation Failed\n\n${error.message || "An unexpected error occurred during AI generation."}\n\n**Common fixes:**\n- Check if \`OPENROUTER_API_KEY\` is set in your environment variables.\n- Ensure you have an internet connection.\n- Try again in a few moments.`
      };
    }
  }

  console.log("[Productivity-Service] Confirming setup for user:", actualUserId);

  // Retrieve from Redis
  const draft = await redis.get<any>(keys.setup_draft);
  if (!draft) {
    console.error("[Productivity-Service] No draft found in Redis for user:", actualUserId);
    return {
      success: false,
      message: `The workspace setup didn’t save because your session expired. Please resend your role (just confirm: “${actualInput.skill}”), and I’ll run the setup again.\n\nIf you want it tailored, add one line with:\n- your **level** (junior/mid/senior)\n- what you’re **building** (SaaS, e-commerce, content site, internal tool).`
    };
  }

  const challenges = draft.habits || [];
  const links = draft.links || [];
  console.log("[Productivity-Service] Applying setup from draft - Challenges:", challenges.length, "Links:", links.length);

  await batchSaveChallenges(actualUserId, challenges.map((h: any, i: number) => ({
    title: h.name,
    completed: false,
    steps: [],
    resources: [],
    role: actualInput.skill,
    order: i
  })));
  await batchSaveLinks(actualUserId, links);

  // Cleanup
  await redis.del(keys.setup_draft);

  return {
    success: true,
    message: `Awesome! Your workspace is now optimized for a ${actualInput.skill}. Your new skills and resources have been added.`
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
