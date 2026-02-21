import { Redis } from "@upstash/redis";

const isConfigured = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

if (!isConfigured && typeof window === "undefined") {
    console.warn("⚠️ [Upstash] Redis environment variables are missing. Some features may not work locally.");
}

// Mock implementation to prevent crashes during development
const mockRedis = {
    get: async () => null,
    set: async () => "OK",
    del: async () => 0,
    incr: async () => 0,
    // Add other methods if needed by the service
} as any;

export const redis = isConfigured
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL?.trim() || "",
        token: process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || "",
    })
    : (mockRedis as Redis);
