import { Redis } from "@upstash/redis";

if (typeof window === "undefined") {
    if (!process.env.UPSTASH_REDIS_REST_URL) {
        console.error("[Upstash] Missing UPSTASH_REDIS_REST_URL");
        throw new Error("Missing Upstash Redis URL");
    }
    if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
        console.error("[Upstash] Missing UPSTASH_REDIS_REST_TOKEN");
        throw new Error("Missing Upstash Redis Token");
    }
}

export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL?.trim() || "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || "",
});
