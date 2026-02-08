import { Redis } from "@upstash/redis";

if (typeof window === "undefined") {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        throw new Error("Missing Upstash Redis environment variables");
    }
}

export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL?.trim(),
    token: process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
});
