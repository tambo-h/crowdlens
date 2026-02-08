/**
 * @file productivity-dashboard.tsx
 * @description Tambo generative component for the main productivity dashboard
 */

"use client";

import { z } from "zod";

export const productivityDashboardSchema = z.object({
  userName: z.string().default("Developer").describe("User's name for personalized greeting"),
  pomodoroSessionsToday: z.number().default(0).describe("Number of pomodoro sessions completed today"),
  challengesCompletedToday: z.number().default(0).describe("Number of challenges completed today"),
  totalChallenges: z.number().default(0).describe("Total number of challenges tracked"),
  currentStreak: z.number().default(0).describe("Current skill streak"),
  recentLinks: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      tags: z.array(z.string()),
    })
  ).default([]).describe("Recently saved links"),
  quote: z.object({
    text: z.string(),
    author: z.string(),
  }).default({
    text: "Focus on being productive instead of busy.",
    author: "Tim Ferriss"
  }).describe("Daily inspirational quote"),
});

type ProductivityDashboardProps = z.input<typeof productivityDashboardSchema>;

import { useProductivity } from "@/context/productivity-context";
import { useEffect, useState } from "react";
import { getProductivityDashboard } from "@/services/productivity-service";
import { ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

export function ProductivityDashboard({
  userName: initialUserName,
  ...initialStats
}: ProductivityDashboardProps) {
  const { pomodoro, challenges, userId, currentEnergy, creativeRefreshTrigger } = useProductivity();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;
    getProductivityDashboard(userId).then(setStats);
  }, [userId, creativeRefreshTrigger]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const dashboardData = stats || {
    pomodoroSessionsToday: pomodoro.sessionsCompleted,
    challengesCompletedToday: challenges.filter(c => c.completed).length,
    totalChallenges: challenges.length,
    currentStreak: 0, // Streak logic disabled for now
    recentLinks: [],
    quote: { text: "Loading inspiration...", author: "TaskStack" }
  };

  const {
    userName = initialUserName || "User",
    pomodoroSessionsToday,
    challengesCompleted,
    totalChallenges,
    currentStreak,
    recentLinks,
    quote,
  } = dashboardData;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {getGreeting()}{userName ? `, ${userName}` : ""}! 👋
          </h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pomodoro Stats */}
          <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Pomodoros Today</h3>
              <span className="text-2xl">⏱️</span>
            </div>
            <p className="text-3xl font-bold text-primary">{pomodoroSessionsToday}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {pomodoroSessionsToday * 25} minutes focused
            </p>
          </div>

          {/* Skill Stats */}
          <div className="bg-card rounded-xl p-6 border border-border hover:border-accent/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Skills Mastery</h3>
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-3xl font-bold text-accent">
              {challengesCompleted}/{totalChallenges}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalChallenges > 0 ? Math.round((challengesCompleted / totalChallenges) * 100) : 0}% complete
            </p>
          </div>

          {/* Streak Stats */}
          <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Current Streak</h3>
              <span className="text-2xl">🔥</span>
            </div>
            <p className="text-3xl font-bold text-primary">{currentStreak}</p>
            <p className="text-xs text-muted-foreground mt-1">days in a row</p>
          </div>

          {/* Energy Stats */}
          <div className="bg-card rounded-xl p-6 border border-border hover:border-indigo-500/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Energy Level</h3>
              <span className="text-2xl">⚡</span>
            </div>
            <p className="text-3xl font-bold text-indigo-400">
              {currentEnergy !== null ? `${currentEnergy}/10` : "No data"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {currentEnergy && currentEnergy <= 3 ? "Recovery Mode Active" : "Performance Mode"}
            </p>
          </div>
        </div>

        {/* Quote of the Day */}
        {quote && (
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-6 border border-primary/20">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">💡 Quote of the Day</h3>
            <p className="text-lg italic text-foreground mb-2">"{quote.text}"</p>
            <p className="text-sm text-muted-foreground text-right">— {quote.author}</p>
          </div>
        )}

        {/* Recent Links */}
        {recentLinks.length > 0 && (
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">📚 Recent Links</h3>
            <div className="space-y-3">
              {recentLinks.slice(0, 3).map((link: any, idx: number) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-primary/30"
                >
                  <h4 className="font-medium text-foreground mb-1">{link.title}</h4>
                  <div className="flex gap-2 flex-wrap">
                    {link.tags?.map((tag: string, tagIdx: number) => (
                      <span
                        key={tagIdx}
                        className="px-2 py-0.5 text-xs rounded-md bg-primary/20 text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Onboarding Tutorial & PIN Copy (Only for new users) */}
        {totalChallenges === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* PIN Copy Card */}
            <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl p-6 border border-indigo-500/30 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShieldCheck className="w-24 h-24 text-indigo-400" />
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  Your Workspace Security
                </h3>
                <p className="text-sm text-indigo-200/70 mb-6 leading-relaxed">
                  Your workspace is protected by a 6-digit PIN. Save this to recover your account if you clear your browser data.
                </p>
                <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/10">
                  <span className="text-2xl font-black tracking-[0.5em] text-white">
                    {userId?.replace("up_", "") || "000000"}
                  </span>
                  <button
                    onClick={() => {
                      const pin = userId?.replace("up_", "") || "000000";
                      navigator.clipboard.writeText(pin);
                      alert("PIN copied to clipboard!");
                    }}
                    className="px-4 py-2 bg-white text-slate-950 rounded-lg text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
                  >
                    Copy PIN
                  </button>
                </div>
              </div>
            </div>

            {/* Prompt Examples Card */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-xl">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Quick Setup Guides
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Next.js Dev", prompt: "setup my workspace as a nextjs developer" },
                  { label: "Business Analyst", prompt: "setup my workspace as a business analyst" },
                  { label: "Project Manager", prompt: "setup my workspace as a project manager" },
                ].map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => {
                      navigator.clipboard.writeText(ex.prompt);
                      alert(`Prompt for ${ex.label} copied! Paste it in the chat to start.`);
                    }}
                    className="w-full p-3 rounded-xl bg-muted/30 border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground">{ex.label}</p>
                      <p className="text-[10px] text-muted-foreground italic truncate max-w-[200px]">"{ex.prompt}"</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors text-center">
            <span className="text-3xl block mb-2">⏱️</span>
            <span className="text-sm font-medium text-primary">Start Pomodoro</span>
          </button>
          <button className="p-4 rounded-xl bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors text-center">
            <span className="text-3xl block mb-2">🏆</span>
            <span className="text-sm font-medium text-accent">Skill Track</span>
          </button>
          <button className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 hover:bg-secondary/20 transition-colors text-center">
            <span className="text-3xl block mb-2">🔗</span>
            <span className="text-sm font-medium text-secondary">Save Link</span>
          </button>
          <button className="p-4 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors text-center">
            <span className="text-3xl block mb-2">📊</span>
            <span className="text-sm font-medium text-primary">View Stats</span>
          </button>
        </div>
      </div>
    </div>
  );
}
