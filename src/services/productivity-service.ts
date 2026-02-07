/**
 * @file productivity-service.ts
 * @description Service functions for productivity tools (Tambo tools)
 */

import { z } from "zod";

/**
 * Get sample productivity data for dashboard
 * In production, this would fetch from Redis
 */
export async function getProductivityDashboard(input: {
  userId?: string;
}): Promise<{
  pomodoroSessionsToday: number;
  habitsCompletedToday: number;
  totalHabits: number;
  currentStreak: number;
  recentLinks: Array<{ title: string; url: string; tags: string[] }>;
  quote: { text: string; author: string };
}> {
  // Mock data - replace with Redis calls in production
  return {
    pomodoroSessionsToday: 3,
    habitsCompletedToday: 2,
    totalHabits: 4,
    currentStreak: 7,
    recentLinks: [
      {
        title: "React Documentation",
        url: "https://react.dev",
        tags: ["react", "docs"],
      },
      {
        title: "TypeScript Handbook",
        url: "https://www.typescriptlang.org/docs/",
        tags: ["typescript", "docs"],
      },
      {
        title: "Tailwind CSS",
        url: "https://tailwindcss.com",
        tags: ["css", "tailwind"],
      },
    ],
    quote: {
      text: "The best way to predict the future is to invent it.",
      author: "Alan Kay",
    },
  };
}

/**
 * Get user's habits with completion status
 */
export async function getHabits(input: {
  userId?: string;
  category?: string;
}): Promise<
  Array<{
    id: string;
    name: string;
    category: "Code" | "Learn" | "Health" | "Review";
    streak: number;
    completedToday: boolean;
  }>
> {
  // Mock data - replace with Redis calls
  const allHabits = [
    {
      id: "1",
      name: "Morning Code Review",
      category: "Code" as const,
      streak: 12,
      completedToday: true,
    },
    {
      id: "2",
      name: "Read Tech Articles",
      category: "Learn" as const,
      streak: 8,
      completedToday: true,
    },
    {
      id: "3",
      name: "30min Exercise",
      category: "Health" as const,
      streak: 5,
      completedToday: false,
    },
    {
      id: "4",
      name: "Daily Standup Log",
      category: "Review" as const,
      streak: 15,
      completedToday: false,
    },
  ];

  if (input.category) {
    return allHabits.filter((h) => h.category === input.category);
  }

  return allHabits;
}

/**
 * Get saved links with filtering
 */
export async function getSavedLinks(input: {
  userId?: string;
  tags?: string[];
  searchQuery?: string;
  limit?: number;
}): Promise<
  Array<{
    id: string;
    title: string;
    url: string;
    tags: string[];
    notes?: string;
    savedAt: string;
  }>
> {
  // Mock data - replace with Redis calls
  const allLinks = [
    {
      id: "1",
      title: "React 19 Release Notes",
      url: "https://react.dev/blog/2024/12/05/react-19",
      tags: ["react", "javascript", "frontend"],
      notes: "New features and breaking changes",
      savedAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Next.js 15 Documentation",
      url: "https://nextjs.org/docs",
      tags: ["nextjs", "react", "framework"],
      notes: "App Router and Server Components guide",
      savedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "3",
      title: "Upstash Redis SDK",
      url: "https://upstash.com/docs/redis",
      tags: ["redis", "database", "serverless"],
      savedAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: "4",
      title: "Tailwind CSS v4 Alpha",
      url: "https://tailwindcss.com/blog/tailwindcss-v4-alpha",
      tags: ["tailwind", "css", "design"],
      notes: "New engine and performance improvements",
      savedAt: new Date(Date.now() - 259200000).toISOString(),
    },
    {
      id: "5",
      title: "TypeScript 5.5 Release",
      url: "https://devblogs.microsoft.com/typescript/",
      tags: ["typescript", "javascript"],
      savedAt: new Date(Date.now() - 345600000).toISOString(),
    },
  ];

  let filtered = allLinks;

  // Filter by tags
  if (input.tags && input.tags.length > 0) {
    filtered = filtered.filter((link) =>
      input.tags!.some((tag) => link.tags.includes(tag))
    );
  }

  // Filter by search query
  if (input.searchQuery) {
    const query = input.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (link) =>
        link.title.toLowerCase().includes(query) ||
        link.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        link.notes?.toLowerCase().includes(query)
    );
  }

  // Apply limit
  if (input.limit) {
    filtered = filtered.slice(0, input.limit);
  }

  return filtered;
}

/**
 * Get random inspirational quote
 */
export async function getInspirationalQuote(input: {
  category?: "technology" | "productivity" | "motivation";
}): Promise<{
  quote: string;
  author: string;
  category: string;
}> {
  // Mock quotes - in production, fetch from API or Redis cache
  const quotes = [
    {
      quote: "The best way to predict the future is to invent it.",
      author: "Alan Kay",
      category: "technology",
    },
    {
      quote:
        "Any sufficiently advanced technology is indistinguishable from magic.",
      author: "Arthur C. Clarke",
      category: "technology",
    },
    {
      quote:
        "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
      category: "productivity",
    },
    {
      quote:
        "Slow productivity is about working at a natural pace, doing fewer things, and obsessing over quality.",
      author: "Cal Newport",
      category: "productivity",
    },
    {
      quote:
        "Code is like humor. When you have to explain it, it's bad.",
      author: "Cory House",
      category: "technology",
    },
    {
      quote:
        "First, solve the problem. Then, write the code.",
      author: "John Johnson",
      category: "productivity",
    },
  ];

  let filteredQuotes = quotes;
  if (input.category) {
    filteredQuotes = quotes.filter((q) => q.category === input.category);
  }

  const randomQuote =
    filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];

  return randomQuote;
}

/**
 * Get Pomodoro statistics
 */
export async function getPomodoroStats(input: {
  userId?: string;
  startDate?: string;
  endDate?: string;
  groupBy?: "day" | "week" | "project";
}): Promise<{
  totalSessions: number;
  totalMinutes: number;
  averagePerDay: number;
  byProject?: Array<{ project: string; sessions: number }>;
  byDay?: Array<{ date: string; sessions: number }>;
}> {
  // Mock data - replace with Redis aggregation
  return {
    totalSessions: 24,
    totalMinutes: 600,
    averagePerDay: 3.4,
    byProject: [
      { project: "Frontend Development", sessions: 12 },
      { project: "API Integration", sessions: 8 },
      { project: "Bug Fixes", sessions: 4 },
    ],
    byDay: [
      { date: "2024-01-15", sessions: 4 },
      { date: "2024-01-16", sessions: 3 },
      { date: "2024-01-17", sessions: 5 },
    ],
  };
}

/**
 * Start a new Pomodoro session
 */
export async function startPomodoroSession(input: {
  userId?: string;
  projectName?: string;
  duration?: number;
}): Promise<{
  sessionId: string;
  startTime: string;
  duration: number;
  projectName?: string;
}> {
  const sessionId = `session_${Date.now()}`;
  const startTime = new Date().toISOString();
  const duration = input.duration || 25;

  // In production: Save to Redis
  // await redis.set(RedisKeys.pomodoro.currentSession(userId), ...)

  return {
    sessionId,
    startTime,
    duration,
    projectName: input.projectName,
  };
}

/**
 * Toggle habit completion
 */
export async function toggleHabit(input: {
  userId?: string;
  habitId: string;
  date?: string;
  completed: boolean;
}): Promise<{
  success: boolean;
  habitId: string;
  completed: boolean;
  newStreak: number;
}> {
  // In production: Update Redis and recalculate streak
  return {
    success: true,
    habitId: input.habitId,
    completed: input.completed,
    newStreak: input.completed ? 8 : 7, // Mock streak calculation
  };
}

/**
 * Save a new link
 */
export async function saveLink(input: {
  userId?: string;
  url: string;
  title: string;
  tags: string[];
  notes?: string;
}): Promise<{
  id: string;
  url: string;
  title: string;
  tags: string[];
  notes?: string;
  savedAt: string;
}> {
  const linkId = `link_${Date.now()}`;
  const savedAt = new Date().toISOString();

  // In production: Save to Redis
  // await redis.zadd(RedisKeys.links.collection(userId), ...)

  return {
    id: linkId,
    url: input.url,
    title: input.title,
    tags: input.tags,
    notes: input.notes,
    savedAt,
  };
}
