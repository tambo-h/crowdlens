/**
 * @file journey-view.tsx
 * @description The dedicated "Level Journey" page. Composes the LevelJourney
 *              timeline with quick stats, achievements, and recent activity.
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useProductivity } from "@/context/productivity-context";
import {
  getUserStats,
  type UserGamification,
} from "@/services/gamification-service";
import { LevelJourney } from "./level-journey";

export function JourneyView() {
  const { userId, creativeRefreshTrigger } = useProductivity();
  const [stats, setStats] = useState<UserGamification | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setStats(await getUserStats(userId));
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh, creativeRefreshTrigger]);

  if (!userId) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Please sign in to view your journey.
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-64 w-full bg-muted rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="max-w-3xl mx-auto py-6 md:py-8 px-2 md:px-0"
    >
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground flex items-center gap-3">
          <span className="text-3xl">👑</span>
          Level Journey
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          See where you stand, what's next, and how far the climb goes.
        </p>
      </div>

      <LevelJourney totalXP={stats.totalXP} streak={stats.streak} />
    </motion.div>
  );
}
