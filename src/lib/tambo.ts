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
import { InteractableSkillTracker, skillTrackerSchema } from "@/components/productivity/skill-tracker";
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
import { InteractableWorkspacePreview, workspacePreviewSchema } from "@/components/productivity/workspace-preview";

// ProductivityFlow Services
import {
  getProductivityDashboard,
  getChallenges,
  getSavedLinks,
  getInspirationalQuote,
  getPomodoroStats,
  startPomodoroSession,
  toggleChallenge,
  saveChallenge,
  deleteChallenge,
  saveLink,
  updateLink,
  deleteLink,
  logDistraction,
  getDistractions,
  saveSnippet,
  getSnippets,
  updateSnippet,
  deleteSnippet,
  saveStandupEntry,
  getStandupHistory,
  logEnergyLevel,
  getEnergyData,
  saveWeeklyReview,
  getWeeklyReviews,
  getPracticedRules,
  togglePracticedRule,
  saveQuote,
  updateQuote,
  deleteQuote,
  seedProductivityData,
  batchSaveLinks,
  setupPersonalizedWorkspace,
  addChallengeStep,
  updateChallengeStep,
  deleteChallengeStep,
} from "@/services/productivity-service";
import { generatePersonalizedData, generateChallengeDetails } from "@/services/ai-service";

export const tools: TamboTool[] = [
  {
    name: "getProductivityDashboard",
    description: "Get comprehensive productivity dashboard data including pomodoro sessions, skill challenges, links, and daily quote",
    tool: getProductivityDashboard as any,
    inputSchema: z.object({ userId: z.string().optional() }),
    outputSchema: z.object({
      pomodoroSessionsToday: z.number(),
      challengesCompletedToday: z.number(),
      totalChallenges: z.number(),
      currentStreak: z.number(),
      recentLinks: z.array(z.object({ title: z.string(), url: z.string(), tags: z.array(z.string()) })),
      quote: z.object({ text: z.string(), author: z.string() }),
    }),
  },
  {
    name: "getChallenges",
    description: "Get user's skill challenges with completion status and detailed steps. Can filter by role.",
    tool: getChallenges as any,
    inputSchema: z.object({ userId: z.string().optional(), role: z.string().optional() }),
    outputSchema: z.array(z.object({
      id: z.string(),
      title: z.string(),
      completed: z.boolean(),
      role: z.string(),
      steps: z.array(z.object({ id: z.string(), title: z.string(), completed: z.boolean() }))
    })),
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
    outputSchema: z.object({ text: z.string(), author: z.string(), category: z.string() }),
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
    name: "toggleChallenge",
    description: "Mark a challenge or a specific step as complete/incomplete.",
    tool: toggleChallenge as any,
    inputSchema: z.object({ challengeId: z.string(), completed: z.boolean().optional(), stepId: z.string().optional() }),
    outputSchema: z.any(),
  },
  {
    name: "saveChallenge",
    description: "Create a new skill challenge.",
    tool: saveChallenge as any,
    inputSchema: z.object({ title: z.string(), role: z.string(), steps: z.array(z.object({ title: z.string() })).optional() }),
    outputSchema: z.any(),
  },
  {
    name: "generateChallengeDetails",
    description: "Generate detailed steps and resources for a specific challenge using AI.",
    tool: generateChallengeDetails as any,
    inputSchema: z.object({ challengeTitle: z.string(), role: z.string() }),
    outputSchema: z.any(),
  },
  {
    name: "deleteChallenge",
    description: "Delete a skill challenge.",
    tool: deleteChallenge as any,
    inputSchema: z.object({ challengeId: z.string() }),
    outputSchema: z.any(),
  },
  {
    name: "saveLink",
    description: "Save a new link to the collection with title, tags, and optional notes.",
    tool: saveLink as any,
    inputSchema: z.object({ url: z.string(), title: z.string(), tags: z.array(z.string()), notes: z.string().optional() }),
    outputSchema: z.object({ id: z.string(), url: z.string(), title: z.string(), tags: z.array(z.string()), notes: z.string().optional(), savedAt: z.string() }),
  },
  {
    name: "updateLink",
    description: "Update an existing link's title, tags, or notes.",
    tool: updateLink as any,
    inputSchema: z.object({ linkId: z.string(), title: z.string().optional(), url: z.string().optional(), tags: z.array(z.string()).optional(), notes: z.string().optional() }),
    outputSchema: z.any(),
  },
  {
    name: "deleteLink",
    description: "Remove a link from the collection.",
    tool: deleteLink as any,
    inputSchema: z.object({ linkId: z.string() }),
    outputSchema: z.any(),
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
    name: "updateSnippet",
    description: "Update an existing code snippet.",
    tool: updateSnippet as any,
    inputSchema: z.object({ snippetId: z.string(), title: z.string().optional(), code: z.string().optional(), language: z.string().optional(), tags: z.array(z.string()).optional() }),
    outputSchema: z.any(),
  },
  {
    name: "deleteSnippet",
    description: "Delete a code snippet.",
    tool: deleteSnippet as any,
    inputSchema: z.object({ snippetId: z.string() }),
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
    inputSchema: z.object({ text: z.string(), author: z.string(), category: z.string() }),
    outputSchema: z.any(),
  },
  {
    name: "updateQuote",
    description: "Update a custom inspirational quote.",
    tool: updateQuote as any,
    inputSchema: z.object({ quoteId: z.string(), text: z.string().optional(), author: z.string().optional(), category: z.string().optional() }),
    outputSchema: z.any(),
  },
  {
    name: "deleteQuote",
    description: "Delete a custom inspirational quote.",
    tool: deleteQuote as any,
    inputSchema: z.object({ quoteId: z.string() }),
    outputSchema: z.any(),
  },
  {
    name: "seedProductivityData",
    description: "Seed the database with example habits and data for a guest user.",
    tool: seedProductivityData,
    inputSchema: z.object({}),
    outputSchema: z.any(),
  },
  {
    name: "setupPersonalizedWorkspace",
    description: "Generates and saves a personalized workspace (habits and links) based on user skill/role.",
    tool: setupPersonalizedWorkspace as any,
    inputSchema: z.object({
      userId: z.string().optional(),
      skill: z.string().describe("The user's role or skill, e.g. 'Next.js Developer'"),
      confirm: z.boolean().optional(),
      data: z.any().optional()
    }),
    outputSchema: z.any(),
  },
  {
    name: "addChallengeStep",
    description: "Add a new manual step/sub-task to a specific challenge.",
    tool: addChallengeStep as any,
    inputSchema: z.object({ challengeId: z.string(), title: z.string() }),
    outputSchema: z.any(),
  },
  {
    name: "updateChallengeStep",
    description: "Update the title of an existing step/sub-task.",
    tool: updateChallengeStep as any,
    inputSchema: z.object({ challengeId: z.string(), stepId: z.string(), title: z.string() }),
    outputSchema: z.any(),
  },
  {
    name: "deleteChallengeStep",
    description: "Delete a specific step/sub-task from a challenge.",
    tool: deleteChallengeStep as any,
    inputSchema: z.object({ challengeId: z.string(), stepId: z.string() }),
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
    name: "SkillTracker",
    description: "Displays and manages user skill challenges and learning steps.",
    component: InteractableSkillTracker,
    propsSchema: skillTrackerSchema,
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
  {
    name: "WorkspacePreview",
    description: "Visual preview of generated skills and resources for a workspace setup.",
    component: InteractableWorkspacePreview,
    propsSchema: workspacePreviewSchema,
  },
];
