"use client";

import { ApiKeyCheck } from "@/components/ApiKeyCheck";
import { ProductivityDashboard } from "@/components/productivity/productivity-dashboard";
import { PomodoroTimer } from "@/components/productivity/pomodoro-timer";
import { HabitTracker } from "@/components/productivity/habit-tracker";
import { InspirationQuote } from "@/components/productivity/inspiration-quote";
import { LinkCard } from "@/components/productivity/link-card";
import { ProductivityRules } from "@/components/productivity/productivity-rules";
import { useState } from "react";

export default function Home() {
  const [activeView, setActiveView] = useState<"dashboard" | "pomodoro" | "habits" | "links" | "inspiration" | "rules">("dashboard");

  // Sample data for components
  const dashboardData = {
    userName: "Developer",
    pomodoroSessionsToday: 3,
    habitsCompletedToday: 2,
    totalHabits: 4,
    currentStreak: 7,
    recentLinks: [
      { title: "React Documentation", url: "https://react.dev", tags: ["react", "docs"] },
      { title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/", tags: ["typescript"] },
    ],
    quote: {
      text: "The best way to predict the future is to invent it.",
      author: "Alan Kay",
    },
  };

  const habitsData = [
    { id: "1", name: "Morning Code Review", category: "Code" as const, streak: 12, completedToday: true },
    { id: "2", name: "Read Tech Articles", category: "Learn" as const, streak: 8, completedToday: true },
    { id: "3", name: "30min Exercise", category: "Health" as const, streak: 5, completedToday: false },
    { id: "4", name: "Daily Standup Log", category: "Review" as const, streak: 15, completedToday: false },
  ];

  const linksData = [
    {
      id: "1",
      title: "React 19 Release Notes",
      url: "https://react.dev/blog/2024/12/05/react-19",
      tags: ["react", "javascript"],
      notes: "New features and breaking changes",
      savedAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Next.js 15 Documentation",
      url: "https://nextjs.org/docs",
      tags: ["nextjs", "react"],
      notes: "App Router guide",
      savedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "3",
      title: "Tailwind CSS v4",
      url: "https://tailwindcss.com",
      tags: ["tailwind", "css"],
      savedAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-6 space-y-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary mb-1">ProductivityFlow</h1>
          <p className="text-xs text-muted-foreground">Calm Dev Edition</p>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => setActiveView("dashboard")}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              activeView === "dashboard"
                ? "bg-primary text-primary-foreground font-medium"
                : "text-foreground hover:bg-muted"
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveView("pomodoro")}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              activeView === "pomodoro"
                ? "bg-primary text-primary-foreground font-medium"
                : "text-foreground hover:bg-muted"
            }`}
          >
            ⏱️ Pomodoro
          </button>
          <button
            onClick={() => setActiveView("habits")}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              activeView === "habits"
                ? "bg-primary text-primary-foreground font-medium"
                : "text-foreground hover:bg-muted"
            }`}
          >
            ✅ Habits
          </button>
          <button
            onClick={() => setActiveView("links")}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              activeView === "links"
                ? "bg-primary text-primary-foreground font-medium"
                : "text-foreground hover:bg-muted"
            }`}
          >
            🔗 Links
          </button>
          <button
            onClick={() => setActiveView("inspiration")}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              activeView === "inspiration"
                ? "bg-primary text-primary-foreground font-medium"
                : "text-foreground hover:bg-muted"
            }`}
          >
            💡 Inspiration
          </button>
          <button
            onClick={() => setActiveView("rules")}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              activeView === "rules"
                ? "bg-primary text-primary-foreground font-medium"
                : "text-foreground hover:bg-muted"
            }`}
          >
            📘 Productivity Rules
          </button>
        </nav>

        <div className="absolute bottom-6 left-6 right-6 space-y-3">
          <div className="border-t border-border pt-4">
            <ApiKeyCheck>
              <a
                href="/chat"
                className="block w-full text-center px-4 py-2 rounded-lg bg-accent text-accent-foreground font-medium hover:opacity-90 transition-opacity text-sm"
              >
                💬 AI Chat
              </a>
            </ApiKeyCheck>
          </div>
          <a
            href="/theme-test"
            className="block text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Theme Test
          </a>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {activeView === "dashboard" && <ProductivityDashboard {...dashboardData} />}
          
          {activeView === "pomodoro" && (
            <div className="flex justify-center items-center min-h-[80vh]">
              <PomodoroTimer workDuration={25} breakDuration={5} longBreakDuration={15} autoStart={false} />
            </div>
          )}
          
          {activeView === "habits" && (
            <div className="flex justify-center items-start pt-12">
              <HabitTracker habits={habitsData} viewMode="week" />
            </div>
          )}
          
          {activeView === "links" && (
            <div className="flex justify-center items-start pt-12">
              <LinkCard links={linksData} viewMode="cards" />
            </div>
          )}
          
          {activeView === "inspiration" && (
            <div className="flex justify-center items-center min-h-[80vh]">
              <InspirationQuote
                quote="The best way to predict the future is to invent it."
                author="Alan Kay"
                category="technology"
                isFavorite={false}
              />
            </div>
          )}
          
          {activeView === "rules" && (
            <div className="flex justify-center items-start pt-12">
              <ProductivityRules showProgress={true} practicedRules={[]} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
