/**
 * @file habit-tracker.tsx
 * @description Tambo generative component for habit tracking
 */

"use client";

import { z } from "zod";
import { useState } from "react";

export const habitTrackerSchema = z.object({
  habits: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      category: z.enum(["Code", "Learn", "Health", "Review"]),
      streak: z.number(),
      completedToday: z.boolean(),
    })
  ).describe("List of habits to track"),
  viewMode: z.enum(["week", "month"]).default("week").describe("Display mode"),
});

type HabitTrackerProps = z.infer<typeof habitTrackerSchema>;

const categoryColors = {
  Code: "#A2D2FF",
  Learn: "#95D5B2",
  Health: "#FFB5A7",
  Review: "#F9DCC4",
};

export function HabitTracker({ habits, viewMode = "week" }: HabitTrackerProps) {
  const [localHabits, setLocalHabits] = useState(habits);

  const toggleHabit = (habitId: string) => {
    setLocalHabits(prev =>
      prev.map(h =>
        h.id === habitId ? { ...h, completedToday: !h.completedToday, streak: !h.completedToday ? h.streak + 1 : h.streak } : h
      )
    );
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-lg border border-border max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Habit Tracker</h2>
        <div className="flex gap-2 text-xs">
          <span className={`px-3 py-1 rounded-md font-medium cursor-pointer ${
            viewMode === "week" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}>
            Week
          </span>
          <span className={`px-3 py-1 rounded-md font-medium cursor-pointer ${
            viewMode === "month" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}>
            Month
          </span>
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-3">
        {localHabits.map((habit) => (
          <div
            key={habit.id}
            className="bg-muted/30 rounded-lg p-4 border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {/* Checkbox */}
                <button
                  onClick={() => toggleHabit(habit.id)}
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                    habit.completedToday
                      ? "bg-primary border-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {habit.completedToday && <span className="text-white text-sm">✓</span>}
                </button>

                {/* Habit Info */}
                <div className="flex-1">
                  <h3 className={`font-medium ${habit.completedToday ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {habit.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: `${categoryColors[habit.category]}20`,
                        color: categoryColors[habit.category],
                        border: `1px solid ${categoryColors[habit.category]}40`,
                      }}
                    >
                      {habit.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Streak */}
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <span className="text-2xl">🔥</span>
                  <span className="text-xl font-bold text-primary">{habit.streak}</span>
                </div>
                <p className="text-xs text-muted-foreground">day streak</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Completed today: <span className="font-bold text-foreground">{localHabits.filter(h => h.completedToday).length}/{localHabits.length}</span>
          </span>
          <span className="text-muted-foreground">
            Total streaks: <span className="font-bold text-primary">{localHabits.reduce((sum, h) => sum + h.streak, 0)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
