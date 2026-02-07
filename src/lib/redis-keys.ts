/**
 * @file redis-keys.ts
 * @description Redis key naming conventions and utilities
 * 
 * This file provides consistent key naming patterns for all Redis operations.
 * All keys are namespaced by user ID to ensure data isolation.
 */

/**
 * Redis key structure for the ProductivityFlow application
 * 
 * Pattern: user:{userId}:{feature}:{subkey}
 * 
 * Examples:
 * - user:abc123:preferences
 * - user:abc123:pomodoro:sessions
 * - user:abc123:habits:log:2024-01-15
 */

export const RedisKeys = {
  /**
   * User preferences and settings
   */
  userPreferences: (userId: string) => `user:${userId}:preferences`,

  /**
   * Pomodoro timer related keys
   */
  pomodoro: {
    sessions: (userId: string) => `user:${userId}:pomodoro:sessions`,
    stats: (userId: string) => `user:${userId}:pomodoro:stats`,
    currentSession: (userId: string) => `user:${userId}:pomodoro:current`,
  },

  /**
   * Habit tracking keys
   */
  habits: {
    definitions: (userId: string) => `user:${userId}:habits`,
    log: (userId: string, date: string) => `user:${userId}:habits:log:${date}`,
    streaks: (userId: string) => `user:${userId}:habits:streaks`,
  },

  /**
   * Link saver keys
   */
  links: {
    collection: (userId: string) => `user:${userId}:links`,
    tags: (userId: string) => `user:${userId}:links:tags`,
    byTag: (userId: string, tag: string) => `user:${userId}:links:tag:${tag}`,
  },

  /**
   * Quotes and inspiration keys
   */
  quotes: {
    favorites: (userId: string) => `user:${userId}:quotes:favorites`,
    custom: (userId: string) => `user:${userId}:quotes:custom`,
    cache: (userId: string) => `user:${userId}:quotes:cache`,
  },

  /**
   * Distraction journal keys
   */
  distractions: {
    log: (userId: string) => `user:${userId}:journal:distractions`,
  },

  /**
   * Code snippets keys
   */
  snippets: {
    collection: (userId: string) => `user:${userId}:snippets`,
    byLanguage: (userId: string, language: string) =>
      `user:${userId}:snippets:lang:${language}`,
  },

  /**
   * Stand-up log keys
   */
  standup: {
    log: (userId: string) => `user:${userId}:standup:log`,
  },

  /**
   * Energy mapping keys
   */
  energy: {
    log: (userId: string) => `user:${userId}:energy:log`,
  },

  /**
   * Productivity rules tracking
   */
  rules: {
    practiced: (userId: string) => `user:${userId}:rules:practiced`,
    progress: (userId: string) => `user:${userId}:rules:progress`,
  },
} as const;

/**
 * Helper function to generate a unique ID for items
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Helper function to format dates consistently for Redis keys
 */
export function formatDateKey(date: Date = new Date()): string {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

/**
 * Helper function to parse date from Redis key
 */
export function parseDateKey(dateKey: string): Date {
  return new Date(dateKey);
}
