import { Redis } from "@upstash/redis";

const isConfigured = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

if (!isConfigured && typeof window === "undefined") {
    throw new Error(
        "FATAL: Upstash Redis environment variables (UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN) are not configured. " +
        "Initialization failed to protect user data."
    );
}

export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL?.trim() || "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || "",
});
