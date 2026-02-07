/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * This file serves as the central place to register your Tambo components and tools.
 * It exports arrays that will be used by the TamboProvider.
 *
 * Read more about Tambo at https://tambo.co/docs
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
} from "@/services/productivity-service";

/**
 * tools
 *
 * This array contains all the Tambo tools that are registered for use within the application.
 * Each tool is defined with its name, description, and expected props. The tools
 * can be controlled by AI to dynamically fetch data based on user interactions.
 */

export const tools: TamboTool[] = [
  // Example tools (keep for reference)
  {
    name: "countryPopulation",
    description:
      "A tool to get population statistics by country with advanced filtering options",
    tool: getCountryPopulations,
    inputSchema: z.object({
      continent: z.string().optional(),
      sortBy: z.enum(["population", "growthRate"]).optional(),
      limit: z.number().optional(),
      order: z.enum(["asc", "desc"]).optional(),
    }),
    outputSchema: z.array(
      z.object({
        countryCode: z.string(),
        countryName: z.string(),
        continent: z.enum([
          "Asia",
          "Africa",
          "Europe",
          "North America",
          "South America",
          "Oceania",
        ]),
        population: z.number(),
        year: z.number(),
        growthRate: z.number(),
      }),
    ),
  },
  {
    name: "globalPopulation",
    description:
      "A tool to get global population trends with optional year range filtering",
    tool: getGlobalPopulationTrend,
    inputSchema: z.object({
      startYear: z.number().optional(),
      endYear: z.number().optional(),
    }),
    outputSchema: z.array(
      z.object({
        year: z.number(),
        population: z.number(),
        growthRate: z.number(),
      }),
    ),
  },

  // ProductivityFlow Tools
  {
    name: "getProductivityDashboard",
    description:
      "Get comprehensive productivity dashboard data including pomodoro sessions, habits, links, and daily quote",
    tool: getProductivityDashboard,
    inputSchema: z.object({
      userId: z.string().optional(),
    }),
    outputSchema: z.object({
      pomodoroSessionsToday: z.number(),
      habitsCompletedToday: z.number(),
      totalHabits: z.number(),
      currentStreak: z.number(),
      recentLinks: z.array(
        z.object({
          title: z.string(),
          url: z.string(),
          tags: z.array(z.string()),
        })
      ),
      quote: z.object({
        text: z.string(),
        author: z.string(),
      }),
    }),
  },
  {
    name: "getHabits",
    description:
      "Get user's habits with completion status and streak information. Can filter by category.",
    tool: getHabits,
    inputSchema: z.object({
      userId: z.string().optional(),
      category: z.string().optional(),
    }),
    outputSchema: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        category: z.enum(["Code", "Learn", "Health", "Review"]),
        streak: z.number(),
        completedToday: z.boolean(),
      })
    ),
  },
  {
    name: "getSavedLinks",
    description:
      "Get saved links with optional filtering by tags or search query. Returns links with metadata.",
    tool: getSavedLinks,
    inputSchema: z.object({
      userId: z.string().optional(),
      tags: z.array(z.string()).optional(),
      searchQuery: z.string().optional(),
      limit: z.number().optional(),
    }),
    outputSchema: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        url: z.string(),
        tags: z.array(z.string()),
        notes: z.string().optional(),
        savedAt: z.string(),
      })
    ),
  },
  {
    name: "getInspirationalQuote",
    description:
      "Get a random inspirational quote for developers. Can filter by category (technology, productivity, motivation).",
    tool: getInspirationalQuote,
    inputSchema: z.object({
      category: z.enum(["technology", "productivity", "motivation"]).optional(),
    }),
    outputSchema: z.object({
      quote: z.string(),
      author: z.string(),
      category: z.string(),
    }),
  },
  {
    name: "getPomodoroStats",
    description:
      "Get Pomodoro timer statistics including total sessions, minutes, and breakdowns by project or day.",
    tool: getPomodoroStats,
    inputSchema: z.object({
      userId: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      groupBy: z.enum(["day", "week", "project"]).optional(),
    }),
    outputSchema: z.object({
      totalSessions: z.number(),
      totalMinutes: z.number(),
      averagePerDay: z.number(),
      byProject: z
        .array(
          z.object({
            project: z.string(),
            sessions: z.number(),
          })
        )
        .optional(),
      byDay: z
        .array(
          z.object({
            date: z.string(),
            sessions: z.number(),
          })
        )
        .optional(),
    }),
  },
  {
    name: "startPomodoroSession",
    description:
      "Start a new Pomodoro work session with optional project tagging and custom duration.",
    tool: startPomodoroSession,
    inputSchema: z.object({
      userId: z.string().optional(),
      projectName: z.string().optional(),
      duration: z.number().optional(),
    }),
    outputSchema: z.object({
      sessionId: z.string(),
      startTime: z.string(),
      duration: z.number(),
      projectName: z.string().optional(),
    }),
  },
  {
    name: "toggleHabit",
    description:
      "Mark a habit as complete or incomplete for a specific date. Updates streak counter.",
    tool: toggleHabit,
    inputSchema: z.object({
      userId: z.string().optional(),
      habitId: z.string(),
      date: z.string().optional(),
      completed: z.boolean(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      habitId: z.string(),
      completed: z.boolean(),
      newStreak: z.number(),
    }),
  },
  {
    name: "saveLink",
    description:
      "Save a new link to the collection with title, tags, and optional notes.",
    tool: saveLink,
    inputSchema: z.object({
      userId: z.string().optional(),
      url: z.string(),
      title: z.string(),
      tags: z.array(z.string()),
      notes: z.string().optional(),
    }),
    outputSchema: z.object({
      id: z.string(),
      url: z.string(),
      title: z.string(),
      tags: z.array(z.string()),
      notes: z.string().optional(),
      savedAt: z.string(),
    }),
  },
];

/**
 * components
 *
 * This array contains all the Tambo components that are registered for use within the application.
 * Each component is defined with its name, description, and expected props. The components
 * can be controlled by AI to dynamically render UI elements based on user interactions.
 */
export const components: TamboComponent[] = [
  // Example components (keep for reference)
  {
    name: "Graph",
    description:
      "A component that renders various types of charts (bar, line, pie) using Recharts. Supports customizable data visualization with labels, datasets, and styling options.",
    component: Graph,
    propsSchema: graphSchema,
  },
  {
    name: "DataCard",
    description:
      "A component that displays options as clickable cards with links and summaries with the ability to select multiple items.",
    component: DataCard,
    propsSchema: dataCardSchema,
  },

  // ProductivityFlow Components
  {
    name: "PomodoroTimer",
    description:
      "Interactive Pomodoro timer with customizable work/break durations, circular progress indicator, session tracking, and project tagging. Displays current time, session type (work/break), and completed sessions.",
    component: PomodoroTimer,
    propsSchema: pomodoroTimerSchema,
  },
  {
    name: "HabitTracker",
    description:
      "Habit tracking component that displays a list of habits with completion status, categories (Code, Learn, Health, Review), and streak counters. Users can toggle habits as complete/incomplete.",
    component: HabitTracker,
    propsSchema: habitTrackerSchema,
  },
  {
    name: "InspirationQuote",
    description:
      "Display inspirational quotes for developers with author attribution, category badges, and favorite toggle. Includes actions to copy, get new quote, or add custom quotes.",
    component: InspirationQuote,
    propsSchema: inspirationQuoteSchema,
  },
  {
    name: "ProductivityDashboard",
    description:
      "Comprehensive productivity dashboard showing Pomodoro stats, habit completion, streaks, recent links, daily quote, and quick action buttons. Perfect for overview page.",
    component: ProductivityDashboard,
    propsSchema: productivityDashboardSchema,
  },
  {
    name: "LinkCard",
    description:
      "Display saved links in card or list view with tags, notes, and saved dates. Supports filtering and provides clickable links to resources.",
    component: LinkCard,
    propsSchema: linkCardSchema,
  },
  {
    name: "ProductivityRules",
    description:
      "Interactive guide to Cal Newport's Slow Productivity principles. Shows 3 rules with expandable details, tips, examples, and progress tracking. Users can mark rules as practiced.",
    component: ProductivityRules,
    propsSchema: productivityRulesSchema,
  },
];
