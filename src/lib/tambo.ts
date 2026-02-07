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
} from "@/services/productivity-service";

export const tools: TamboTool[] = [
  // ProductivityFlow Tools
  {
    name: "getProductivityDashboard",
    description: "Get comprehensive productivity dashboard data.",
    tool: getProductivityDashboard,
    inputSchema: z.object({ userId: z.string().optional() }),
    outputSchema: z.any(),
  },
  {
    name: "getHabits",
    description: "Get user's habits with completion status.",
    tool: getHabits,
    inputSchema: z.object({ userId: z.string().optional(), category: z.string().optional() }),
    outputSchema: z.array(z.any()),
  },
  {
    name: "getSavedLinks",
    description: "Get saved links.",
    tool: getSavedLinks,
    inputSchema: z.object({ userId: z.string().optional(), tags: z.array(z.string()).optional(), searchQuery: z.string().optional() }),
    outputSchema: z.array(z.any()),
  },
  {
    name: "getInspirationalQuote",
    description: "Get random quote.",
    tool: getInspirationalQuote,
    inputSchema: z.object({ category: z.enum(["technology", "productivity", "motivation"]).optional() }),
    outputSchema: z.any(),
  },
  {
    name: "getPomodoroStats",
    description: "Get Pomodoro stats.",
    tool: getPomodoroStats,
    inputSchema: z.object({ userId: z.string().optional() }),
    outputSchema: z.any(),
  },
  {
    name: "startPomodoroSession",
    description: "Start Pomodoro session.",
    tool: startPomodoroSession,
    inputSchema: z.object({ projectName: z.string().optional(), duration: z.number().optional() }),
    outputSchema: z.any(),
  },
  {
    name: "toggleHabit",
    description: "Toggle habit completion.",
    tool: toggleHabit,
    inputSchema: z.object({ habitId: z.string(), completed: z.boolean() }),
    outputSchema: z.any(),
  },
  {
    name: "saveLink",
    description: "Save a new link.",
    tool: saveLink,
    inputSchema: z.object({ url: z.string(), title: z.string(), tags: z.array(z.string()) }),
    outputSchema: z.any(),
  },
  // Creative Tools
  {
    name: "logDistraction",
    description: "Log a work distraction.",
    tool: logDistraction,
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
    description: "Save code snippet.",
    tool: saveSnippet,
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
    description: "Log daily standup.",
    tool: saveStandupEntry,
    inputSchema: z.object({ today: z.string(), yesterday: z.string(), blockers: z.string() }),
    outputSchema: z.any(),
  },
  {
    name: "getStandupHistory",
    description: "Get standup history.",
    tool: getStandupHistory,
    inputSchema: z.object({}),
    outputSchema: z.array(z.any()),
  },
  {
    name: "logEnergyLevel",
    description: "Track energy level (1-10).",
    tool: logEnergyLevel,
    inputSchema: z.object({ level: z.number(), notes: z.string().optional() }),
    outputSchema: z.any(),
  },
  {
    name: "getEnergyData",
    description: "Get energy logs.",
    tool: getEnergyData,
    inputSchema: z.object({}),
    outputSchema: z.array(z.any()),
  },
  {
    name: "saveWeeklyReview",
    description: "Log weekly review (accomplishments, challenges, next steps).",
    tool: saveWeeklyReview,
    inputSchema: z.object({ accomplishments: z.string(), challenges: z.string(), nextWeekGoals: z.string(), rating: z.number() }),
    outputSchema: z.any(),
  },
  {
    name: "getWeeklyReviews",
    description: "Get past weekly reviews.",
    tool: getWeeklyReviews,
    inputSchema: z.object({}),
    outputSchema: z.array(z.any()),
  },
];

export const components: TamboComponent[] = [
  {
    name: "Graph",
    description: "Renders charts.",
    component: Graph,
    propsSchema: graphSchema,
  },
  {
    name: "PomodoroTimer",
    description: "Pomodoro timer.",
    component: PomodoroTimer,
    propsSchema: pomodoroTimerSchema,
  },
  {
    name: "HabitTracker",
    description: "Habit tracker.",
    component: HabitTracker,
    propsSchema: habitTrackerSchema,
  },
  {
    name: "InspirationQuote",
    description: "Inspirational quotes.",
    component: InspirationQuote,
    propsSchema: inspirationQuoteSchema,
  },
  {
    name: "ProductivityDashboard",
    description: "Main dashboard.",
    component: ProductivityDashboard,
    propsSchema: productivityDashboardSchema,
  },
  {
    name: "LinkCard",
    description: "Saved links.",
    component: LinkCard,
    propsSchema: linkCardSchema,
  },
  {
    name: "ProductivityRules",
    description: "Slow Productivity rules.",
    component: ProductivityRules,
    propsSchema: productivityRulesSchema,
  },
  {
    name: "DistractionJournal",
    description: "Log and visualize distractions.",
    component: StyledDistractionJournal,
    propsSchema: distractionJournalSchema,
  },
  {
    name: "CodeSnippets",
    description: "Manage code snippets.",
    component: StyledCodeSnippets,
    propsSchema: codeSnippetsSchema,
  },
  {
    name: "StandupLog",
    description: "Log daily standup status.",
    component: StyledStandupLog,
    propsSchema: standupLogSchema,
  },
  {
    name: "EnergyMapper",
    description: "Track and visualize energy levels throughout the day.",
    component: StyledEnergyMapper,
    propsSchema: energyMapperSchema,
  },
  {
    name: "WeeklyReview",
    description: "Perform structured weekly reflections.",
    component: StyledWeeklyReview,
    propsSchema: weeklyReviewSchema,
  },
];
