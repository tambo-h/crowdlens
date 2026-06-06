/**
 * @file nudge-manager.ts
 * @description Client-side hook that listens for XP gain events and decides
 * which encouragement nudge (if any) to fire. The "big list of configurations"
 * lives in `nudges-config.ts`; this file wires it up to a per-user session.
 *
 * Tracked state (in-memory, per tab):
 *  - task completions in the current session
 *  - timestamps of recent completions (for combo / speed detection)
 *  - roles touched in this session
 *  - last action timestamp (for comeback detection)
 *  - recent nudge ids (to avoid spam)
 *
 * The manager is exposed via `useNudgeManager()` which returns an `onXP`
 * callback. The SkillTracker calls it after each toggle.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useXPToast } from "@/components/productivity/xp-toast";
import {
  findMilestone,
  findCombo,
  findSpeed,
  findStreak,
  findVariety,
  findComeback,
  findLevelUp,
  pickGeneric,
  type AnyNudge,
} from "@/services/nudges-config";

interface NudgeState {
  /** Task count in current session */
  taskCount: number;
  /** Recent completion timestamps (ms) */
  recentTimestamps: number[];
  /** Unique roles touched in this session */
  roles: Set<string>;
  /** ISO string of last action */
  lastActionAt: string | null;
  /** Nudge ids fired this session (for de-duplication) */
  firedNudgeIds: Set<string>;
  /** Last generic nudge id (so we don't repeat) */
  lastGenericId: string | null;
}

const STORAGE_KEY = "taskstack_nudge_state_v1";
const COMBO_WINDOW_MIN = 10;       // 10 min default for combo detection
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 min idle = new session

const newState = (): NudgeState => ({
  taskCount: 0,
  recentTimestamps: [],
  roles: new Set(),
  lastActionAt: null,
  firedNudgeIds: new Set(),
  lastGenericId: null,
});

export interface XPFeedbackPayload {
  action: string;
  amount: number;
  multiplier: number;
  label: string;
  levelUp?: { level: number; title: string; emoji: string };
  achievement?: { id: string; title: string; emoji: string; bonus: number };
  meta?: Record<string, any>;
}

export interface NudgeManager {
  /** Record an XP-gaining event. Returns the nudge that fired (or null). */
  onXP: (payload: XPFeedbackPayload) => AnyNudge | null;
  /** Reset session state (e.g. on logout) */
  reset: () => void;
  /** Current task count in this session */
  taskCount: number;
}

export function useNudgeManager(): NudgeManager {
  const { showNudge, showXP } = useXPToast();
  const [taskCount, setTaskCount] = useState(0);
  const stateRef = useRef<NudgeState>(newState());

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      // If last action was a long time ago, reset session
      const last = parsed.lastActionAt ? new Date(parsed.lastActionAt).getTime() : 0;
      const idle = Date.now() - last;
      if (idle > SESSION_TIMEOUT_MS) {
        stateRef.current = newState();
        return;
      }
      stateRef.current = {
        taskCount: parsed.taskCount || 0,
        recentTimestamps: Array.isArray(parsed.recentTimestamps) ? parsed.recentTimestamps : [],
        roles: new Set(parsed.roles || []),
        lastActionAt: parsed.lastActionAt || null,
        firedNudgeIds: new Set(parsed.firedNudgeIds || []),
        lastGenericId: parsed.lastGenericId || null,
      };
      setTaskCount(stateRef.current.taskCount);
    } catch {
      stateRef.current = newState();
    }
  }, []);

  // Persist on change
  const persist = useCallback(() => {
    if (typeof window === "undefined") return;
    const s = stateRef.current;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          taskCount: s.taskCount,
          recentTimestamps: s.recentTimestamps,
          roles: Array.from(s.roles),
          lastActionAt: s.lastActionAt,
          firedNudgeIds: Array.from(s.firedNudgeIds),
          lastGenericId: s.lastGenericId,
        })
      );
    } catch {
      /* ignore */
    }
  }, []);

  const fireNudge = useCallback(
    (nudge: AnyNudge, sub?: string) => {
      if (stateRef.current.firedNudgeIds.has(nudge.id)) return null;
      // Don't fire generic nudges that just fired
      if (nudge.category === "generic" && stateRef.current.lastGenericId === nudge.id) return null;
      stateRef.current.firedNudgeIds.add(nudge.id);
      if (nudge.category === "generic") stateRef.current.lastGenericId = nudge.id;
      showNudge({ message: nudge.message, emoji: nudge.emoji, variant: nudge.variant, sub });
      persist();
      return nudge;
    },
    [showNudge, persist]
  );

  const maybeFireGeneric = useCallback(() => {
    // Only show generic nudges for non-celebration actions, ~40% of the time
    if (Math.random() > 0.4) return;
    const g = pickGeneric();
    fireNudge(g);
  }, [fireNudge]);

  const onXP = useCallback(
    (payload: XPFeedbackPayload): AnyNudge | null => {
      const s = stateRef.current;
      const now = Date.now();
      const prevActionAt = s.lastActionAt;
      s.lastActionAt = new Date(now).toISOString();

      // Track role
      const role = payload.meta?.role as string | undefined;
      if (role) s.roles.add(role);

      // Track completion (only count challenge completions as "tasks")
      // We also count pomodoro_complete and step completions.
      const isTaskAction =
        payload.action === "challenge_step_complete" ||
        payload.action === "challenge_complete" ||
        payload.action === "pomodoro_complete" ||
        payload.action === "weekly_review";
      if (!isTaskAction) {
        persist();
        return null;
      }

      s.taskCount += 1;
      s.recentTimestamps.push(now);
      // Trim old timestamps beyond 30 min
      s.recentTimestamps = s.recentTimestamps.filter((t) => now - t < 30 * 60 * 1000);
      setTaskCount(s.taskCount);

      // Detect comeback (large gap from previous action)
      if (prevActionAt) {
        const hoursSince = (now - new Date(prevActionAt).getTime()) / 3_600_000;
        const comeback = findComeback(hoursSince);
        if (comeback) fireNudge(comeback);
      }

      // Try higher-priority nudges first
      // 1. Speed (very rapid completions)
      for (const winMin of [1, 2, 5, 10, 15, 20, 30]) {
        const within = s.recentTimestamps.filter((t) => now - t < winMin * 60 * 1000);
        if (within.length < 2) continue;
        const speed = findSpeed(within.length, winMin);
        if (speed) {
          const fired = fireNudge(speed);
          if (fired) {
            persist();
            return fired;
          }
        }
      }

      // 2. Milestone (exact task count)
      const milestone = findMilestone(s.taskCount);
      if (milestone) {
        const fired = fireNudge(milestone, `${s.taskCount} tasks deep`);
        if (fired) {
          // Reset recent combo window so the same action doesn't double-fire
          s.recentTimestamps = [now];
          persist();
          return fired;
        }
      }

      // 3. Combo (multiple tasks within window)
      for (const winMin of [5, 10, 15, 20, 30]) {
        const within = s.recentTimestamps.filter((t) => now - t < winMin * 60 * 1000);
        if (within.length < 3) continue;
        const combo = findCombo(within.length, winMin);
        if (combo) {
          const fired = fireNudge(combo, `${within.length} in ${winMin} min`);
          if (fired) {
            persist();
            return fired;
          }
        }
      }

      // 4. Variety (mixing roles)
      const variety = findVariety(s.roles.size);
      if (variety && s.taskCount >= 2) {
        const fired = fireNudge(variety, `${s.roles.size} different tracks this session`);
        if (fired) {
          persist();
          return fired;
        }
      }

      // 5. Generic ambient nudge (~40% chance)
      maybeFireGeneric();

      persist();
      return null;
    },
    [fireNudge, maybeFireGeneric, persist]
  );

  const reset = useCallback(() => {
    stateRef.current = newState();
    setTaskCount(0);
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { onXP, reset, taskCount };
}

/* ------------------------------------------------------------------ */
/* Pure helper: derive a "mild" generic nudge, useful for ad-hoc calls */
/* ------------------------------------------------------------------ */

export function getMildNudge() {
  return pickGeneric();
}
