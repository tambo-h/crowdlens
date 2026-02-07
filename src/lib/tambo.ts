/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 */

import { Graph, graphSchema } from "@/components/tambo/graph";
import { DataCard, dataCardSchema } from "@/components/ui/card-data";
import {
  getCountryPopulations,
  getGlobalPopulationTrend,
} from "@/services/population-stats";
import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";

// ProductivityFlow Components
import { PomodoroTimer, pomodoroTimerSchema } from "@/components/productivity/pomodoro-timer";
import { HabitTracker, habitTrackerSchema } from "@/components/productivity/habit-tracker";
import { InspirationQuote, inspirationQuoteSchema } from "@/components/productivity/inspiration-quote";
import { ProductivityDashboard, productivityDashboardSchema } from "@/components/productivity/productivity-dashboard";
import { LinkCard, linkCardSchema } from "@/components/productivity/link-card";
import { ProductivityRules, productivityRulesSchema } from "@/components/productivity/productivity-rules";

// Creative Tools Components
import { StyledDistractionJournal, distractionJournalSchema } from "@/components/productivity/creative/distraction-journal/styled-journal";
import { StyledCodeSnippets, codeSnippetsSchema } from "@/components/productivity/creative/code-snippets/styled-snippets";
import { StyledStandupLog, standupLogSchema } from "@/components/productivity/creative/standup-log/styled-standup";
import { StyledEnergyMapper, energyMapperSchema } from "@/components/productivity/creative/energy-mapper/styled-mapper";
import { StyledWeeklyReview, weeklyReviewSchema } from "@/components/productivity/creative/weekly-review/styled-review";

// ProductivityFlow Services
import {
  getProductivityDashboard,
  getHabits,
  getSavedLinks,
  getInspirationalQuote,
  getPomodoroStats,
  startPomodoroSession,
  toggleHabit,
  saveHabit,
  saveLink,
  logDistraction,
  getDistractions,
  saveSnippet,
  getSnippets,
  saveStandupEntry,
  getStandupHistory,
  logEnergyLevel,
  getEnergyData,
  saveWeeklyReview,
  getWeeklyReviews,
  getPracticedRules,
  togglePracticedRule,
  saveQuote,
  seedProductivityData,
} from "@/services/productivity-service";

export const tools: TamboTool[] = [
  {
    name: "getProductivityDashboard",
    description: "Get comprehensive productivity dashboard data including pomodoro sessions, habits, links, and daily quote",
    tool: getProductivityDashboard as any,
    inputSchema: z.object({ userId: z.string().optional() }),
    outputSchema: z.object({
      pomodoroSessionsToday: z.number(),
      habitsCompletedToday: z.number(),
      totalHabits: z.number(),
      currentStreak: z.number(),
      recentLinks: z.array(z.object({ title: z.string(), url: z.string(), tags: z.array(z.string()) })),
      quote: z.object({ text: z.string(), author: z.string() }),
    }),
  },
  {
    name: "getHabits",
    description: "Get user's habits with completion status and streak information. Can filter by category.",
    tool: getHabits,
    inputSchema: z.object({ userId: z.string().optional(), category: z.string().optional() }),
    outputSchema: z.array(z.object({ id: z.string(), name: z.string(), category: z.enum(["Code", "Learn", "Health", "Review"]), streak: z.number(), completedToday: z.boolean() })),
  },
  {
    name: "getSavedLinks",
    description: "Get saved links with optional filtering by tags or search query.",
    tool: getSavedLinks,
    inputSchema: z.object({ userId: z.string().optional(), tags: z.array(z.string()).optional(), searchQuery: z.string().optional() }),
    outputSchema: z.array(z.object({ id: z.string(), title: z.string(), url: z.string(), tags: z.array(z.string()), notes: z.string().optional(), savedAt: z.string() })),
  },
  {
    name: "getInspirationalQuote",
    description: "Get a random inspirational quote for developers.",
    tool: getInspirationalQuote,
    inputSchema: z.object({ category: z.enum(["technology", "productivity", "motivation"]).optional() }),
    outputSchema: z.object({ quote: z.string(), author: z.string(), category: z.string() }),
  },
  {
    name: "getPomodoroStats",
    description: "Get Pomodoro timer statistics.",
    tool: getPomodoroStats,
    inputSchema: z.object({ userId: z.string().optional() }),
    outputSchema: z.any(),
  },
  {
    name: "startPomodoroSession",
    description: "Start a new Pomodoro work session.",
    tool: startPomodoroSession,
    inputSchema: z.object({ projectName: z.string().optional(), duration: z.number().optional() }),
    outputSchema: z.any(),
  },
  {
    name: "toggleHabit",
    description: "Mark a habit as complete or incomplete.",
    tool: toggleHabit as any,
    inputSchema: z.object({ habitId: z.string(), completed: z.boolean() }),
    outputSchema: z.any(),
  },
  {
    name: "saveHabit",
    description: "Create a new habit to track.",
    tool: saveHabit as any,
    inputSchema: z.object({ name: z.string(), category: z.enum(["Code", "Learn", "Health", "Review"]) }),
    outputSchema: z.any(),
  },
  {
    name: "saveLink",
    description: "Save a new link to the collection with title, tags, and optional notes.",
    tool: saveLink as any,
    inputSchema: z.object({ url: z.string(), title: z.string(), tags: z.array(z.string()), notes: z.string().optional() }),
    outputSchema: z.object({ id: z.string(), url: z.string(), title: z.string(), tags: z.array(z.string()), notes: z.string().optional(), savedAt: z.string() }),
  },
  // Creative Tools
  {
    name: "logDistraction",
    description: "Log a work distraction with description and duration.",
    tool: logDistraction as any,
    inputSchema: z.object({ description: z.string(), durationMinutes: z.number(), category: z.string().optional() }),
    outputSchema: z.any(),
  },
  {
    name: "getDistractions",
    description: "Get distraction history.",
    tool: getDistractions,
    inputSchema: z.object({ startDate: z.string().optional() }),
    outputSchema: z.array(z.any()),
  },
  {
    name: "saveSnippet",
    description: "Save a reusable code snippet.",
    tool: saveSnippet as any,
    inputSchema: z.object({ title: z.string(), code: z.string(), language: z.string(), tags: z.array(z.string()).optional() }),
    outputSchema: z.any(),
  },
  {
    name: "getSnippets",
    description: "Get saved snippets.",
    tool: getSnippets,
    inputSchema: z.object({ language: z.string().optional(), searchQuery: z.string().optional() }),
    outputSchema: z.array(z.any()),
  },
  {
    name: "saveStandupEntry",
    description: "Log daily standup status.",
    tool: saveStandupEntry as any,
    inputSchema: z.object({ today: z.string(), yesterday: z.string(), blockers: z.string() }),
    outputSchema: z.any(),
  },
  {
    name: "logEnergyLevel",
    description: "Track energy level (1-10).",
    tool: logEnergyLevel as any,
    inputSchema: z.object({ level: z.number(), notes: z.string().optional() }),
    outputSchema: z.any(),
  },
  {
    name: "saveWeeklyReview",
    description: "Log weekly review (accomplishments, challenges, goals).",
    tool: saveWeeklyReview as any,
    inputSchema: z.object({ accomplishments: z.string(), challenges: z.string(), nextWeekGoals: z.string(), rating: z.number() }),
    outputSchema: z.any(),
  },
  {
    name: "togglePracticedRule",
    description: "Mark a Slow Productivity principle as practiced or not.",
    tool: togglePracticedRule as any,
    inputSchema: z.object({ ruleId: z.number() }),
    outputSchema: z.any(),
  },
  {
    name: "saveQuote",
    description: "Save a new inspirational quote.",
    tool: saveQuote as any,
    inputSchema: z.object({ quote: z.string(), author: z.string(), category: z.string() }),
    outputSchema: z.any(),
  },
  {
    name: "seedProductivityData",
    description: "Seed the database with example habits and data for a guest user.",
    tool: seedProductivityData,
    inputSchema: z.object({}),
    outputSchema: z.any(),
  },
];

export const components: TamboComponent[] = [
  {
    name: "PomodoroTimer",
    description: "Interactive Pomodoro timer with progress tracking.",
    component: PomodoroTimer,
    propsSchema: pomodoroTimerSchema,
  },
  {
    name: "HabitTracker",
    description: "Habit tracking with completion status and streaks.",
    component: HabitTracker,
    propsSchema: habitTrackerSchema,
  },
  {
    name: "InspirationQuote",
    description: "Display inspirational quotes for developers.",
    component: InspirationQuote,
    propsSchema: inspirationQuoteSchema,
  },
  {
    name: "ProductivityDashboard",
    description: "Main productivity overview dashboard.",
    component: ProductivityDashboard,
    propsSchema: productivityDashboardSchema,
  },
  {
    name: "LinkCard",
    description: "Display saved links with tags and notes.",
    component: LinkCard,
    propsSchema: linkCardSchema,
  },
  {
    name: "ProductivityRules",
    description: "Slow Productivity principles guide.",
    component: ProductivityRules,
    propsSchema: productivityRulesSchema,
  },
  {
    name: "DistractionJournal",
    description: "Log and visualize work distractions.",
    component: StyledDistractionJournal,
    propsSchema: distractionJournalSchema,
  },
  {
    name: "CodeSnippets",
    description: "Manage reusable code snippets.",
    component: StyledCodeSnippets,
    propsSchema: codeSnippetsSchema,
  },
  {
    name: "StandupLog",
    description: "Daily standup progress tracker.",
    component: StyledStandupLog,
    propsSchema: standupLogSchema,
  },
  {
    name: "EnergyMapper",
    description: "Daily energy levels visualization.",
    component: StyledEnergyMapper,
    propsSchema: energyMapperSchema,
  },
  {
    name: "WeeklyReview",
    description: "Structured weekly reflection tool.",
    component: StyledWeeklyReview,
    propsSchema: weeklyReviewSchema,
  },
];
