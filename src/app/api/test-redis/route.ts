/**
 * @file route.ts
 * @description API route to test Redis connection
 * 
 * This route helps verify that Redis is properly configured
 */

import { redis, isRedisAvailable } from "@/lib/redis";
import { RedisKeys } from "@/lib/redis-keys";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check if Redis is configured
    if (!isRedisAvailable()) {
      return NextResponse.json(
        {
          success: false,
          error: "Redis is not configured",
          message:
            "Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in your .env.local file",
        },
        { status: 503 }
      );
    }

    // Test Redis connection with a simple ping
    const testKey = RedisKeys.userPreferences("test-user");
    const testData = {
      theme: "light",
      pomodoroDuration: 25,
      testTimestamp: new Date().toISOString(),
    };

    // Write test data
    await redis!.set(testKey, JSON.stringify(testData));

    // Read test data back
    const retrieved = await redis!.get(testKey);

    // Clean up test data
    await redis!.del(testKey);

    return NextResponse.json({
      success: true,
      message: "Redis connection successful!",
      test: {
        written: testData,
        retrieved: retrieved ? JSON.parse(retrieved as string) : null,
        match: JSON.stringify(testData) === retrieved,
      },
    });
  } catch (error) {
    console.error("Redis test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Redis connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
