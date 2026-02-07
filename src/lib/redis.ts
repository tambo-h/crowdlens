/**
 * @file redis.ts
 * @description Redis client configuration for Upstash
 * 
 * This file provides the Redis client instance used throughout the application
 * for storing and retrieving user data.
 */

import { Redis } from "@upstash/redis";

// Check if Redis credentials are configured
const isRedisConfigured = () => {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
};

// Create Redis client instance
// This will be undefined if credentials are not configured
export const redis = isRedisConfigured()
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

/**
 * Check if Redis is available and configured
 */
export const isRedisAvailable = (): boolean => {
  return redis !== null;
};

/**
 * Gracefully handle Redis operations with fallback
 * Returns null if Redis is not available
 */
export async function safeRedisOperation<T>(
  operation: () => Promise<T>,
  fallbackValue: T | null = null
): Promise<T | null> {
  if (!isRedisAvailable()) {
    console.warn("Redis is not configured. Operation skipped.");
    return fallbackValue;
  }

  try {
    return await operation();
  } catch (error) {
    console.error("Redis operation failed:", error);
    return fallbackValue;
  }
}

export default redis;
