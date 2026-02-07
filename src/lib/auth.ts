/**
 * @file auth.ts
 * @description User authentication and identification utilities
 * 
 * For MVP: Uses localStorage-based UUID for user identification
 * For Production: Can be replaced with Clerk, NextAuth, or other auth providers
 */

"use client";

import { v4 as uuidv4 } from "uuid";

const USER_ID_KEY = "productivityflow_user_id";

/**
 * Get or create a user ID
 * 
 * For MVP, this generates a UUID and stores it in localStorage.
 * This allows users to use the app without authentication while
 * persisting their data across sessions.
 * 
 * @returns User ID string
 */
export function getUserId(): string {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    // Server-side: return a temporary ID or handle appropriately
    return "server-temp-id";
  }

  // Try to get existing user ID from localStorage
  let userId = localStorage.getItem(USER_ID_KEY);

  // If no user ID exists, create a new one
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem(USER_ID_KEY, userId);
  }

  return userId;
}

/**
 * Clear the current user ID (useful for logout or reset)
 */
export function clearUserId(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_ID_KEY);
  }
}

/**
 * Check if a user ID exists
 */
export function hasUserId(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return localStorage.getItem(USER_ID_KEY) !== null;
}

/**
 * Hook-style function to get user ID (for React components)
 * Safe to call in components, handles SSR gracefully
 */
export function useUserId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return getUserId();
}
