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
import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, ArrowRight, TrendingUp, Zap, Target, Clock, LifeBuoy } from "lucide-react";
import { cn } from "@/lib/utils";

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
    currentStreak: 0,
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Header */}
        <header className="mb-12">
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <motion.h1
                className="text-3xl md:text-5xl font-black text-foreground mb-3 tracking-tight"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              >
                {getGreeting()}{userName ? `, ${userName}` : ""}! <span className="inline-block animate-bounce-slow">👋</span>
              </motion.h1>
              <p className="text-muted-foreground font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="flex gap-2">
              <div className="px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Productivity Boost Active
              </div>
            </div>
          </motion.div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Pomodoro Stats */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="group relative bg-card/40 backdrop-blur-xl rounded-3xl p-6 border border-border/50 hover:bg-card/60 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Clock className="w-20 h-20 text-primary" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Flow Sessions</span>
            </div>
            <p className="text-4xl font-black text-foreground mb-1">{pomodoroSessionsToday}</p>
            <p className="text-xs text-muted-foreground font-medium">
              {pomodoroSessionsToday * 25} minutes of focus
            </p>
          </motion.div>

          {/* Skills Mastery Stats */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="group relative bg-card/40 backdrop-blur-xl rounded-3xl p-6 border border-border/50 hover:bg-card/60 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Target className="w-20 h-20 text-accent" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Skill Mastery</span>
            </div>
            <p className="text-4xl font-black text-foreground mb-1">
              {Array.from(new Set(challenges.map(c => c.role || "General"))).length}
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              {challengesCompleted}/{totalChallenges} tasks finished
            </p>
          </motion.div>

          {/* Streak Stats */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="group relative bg-card/40 backdrop-blur-xl rounded-3xl p-6 border border-border/50 hover:bg-card/60 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp className="w-20 h-20 text-orange-400" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-orange-400/10 flex items-center justify-center text-orange-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Power Streak</span>
            </div>
            <p className="text-4xl font-black text-foreground mb-1">{currentStreak}</p>
            <p className="text-xs text-muted-foreground font-medium">Consecutive mastery days</p>
          </motion.div>

          {/* Energy Stats */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="group relative bg-card/40 backdrop-blur-xl rounded-3xl p-6 border border-border/50 hover:bg-card/60 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Zap className="w-20 h-20 text-indigo-400" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-400/10 flex items-center justify-center text-indigo-400">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Biometric Energy</span>
            </div>
            <p className="text-4xl font-black text-indigo-400 mb-1">
              {currentEnergy !== null ? `${currentEnergy}/10` : "--"}
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              {currentEnergy && currentEnergy <= 3 ? "Recovery mode recommended" : "Peak performance zone"}
            </p>
          </motion.div>
        </div>

        {/* Quote & Insights Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <motion.div
            variants={itemVariants}
            className="xl:col-span-2 bg-gradient-to-br from-primary/10 via-background to-accent/10 rounded-[2rem] p-8 border border-primary/20 relative overflow-hidden group shadow-2xl shadow-primary/5"
          >
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-all duration-1000" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                <Zap className="w-3 h-3" /> Daily Insight
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-6 leading-tight italic">
                "{quote?.text}"
              </p>
              <div className="flex items-center justify-between border-t border-border/50 pt-6 mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-muted-foreground">
                    {quote?.author.charAt(0)}
                  </div>
                  <span className="font-bold text-foreground">{quote?.author}</span>
                </div>
                <button className="p-3 rounded-full bg-background border border-border hover:bg-muted hover:scale-110 transition-all shadow-sm">
                  <ArrowRight className="w-4 h-4 text-primary" />
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-card/40 backdrop-blur-xl rounded-[2rem] p-8 border border-border shadow-xl h-full"
          >
            <h3 className="text-lg font-black text-foreground mb-6 flex items-center gap-2 uppercase tracking-tight">
              <Target className="w-5 h-5 text-accent" />
              Pulse
            </h3>
            <div className="space-y-4">
              {[
                { label: "Focus Efficiency", value: "92%", color: "text-green-400" },
                { label: "Completion Rate", value: "78%", color: "text-primary" },
                { label: "Energy Stability", value: "High", color: "text-indigo-400" },
              ].map((metric) => (
                <div key={metric.label} className="p-4 rounded-2xl bg-muted/30 border border-border flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase">{metric.label}</span>
                  <span className={cn("text-lg font-black", metric.color)}>{metric.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Onboarding / Contextual Help */}
        {totalChallenges === 0 && (
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* PIN Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 opacity-20 group-hover:scale-110 transition-transform duration-1000">
                <ShieldCheck className="w-48 h-48 text-white" />
              </div>
              <div className="relative z-10 flex flex-col h-full">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-indigo-300" />
                  Workspace Encryption
                </h3>
                <p className="text-indigo-100/70 text-sm mb-8 max-w-[80%] leading-relaxed">
                  Your local-first data is encrypted. Use this unique PIN to sync your workspace across devices.
                </p>
                <div className="mt-auto flex items-center justify-between p-5 bg-black/20 backdrop-blur-md rounded-2xl border border-white/5">
                  <span className="text-xl sm:text-3xl font-black tracking-[0.3em] sm:tracking-[0.4em] text-white">
                    {userId?.replace("up_", "") || "000000"}
                  </span>
                  <button
                    onClick={() => {
                      const pin = userId?.replace("up_", "") || "000000";
                      navigator.clipboard.writeText(pin);
                    }}
                    className="px-6 py-2.5 bg-white text-indigo-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 active:scale-95 transition-all shadow-xl"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Guides */}
            <div className="bg-card rounded-[2rem] p-8 border border-border shadow-xl">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary" />
                Initialize OS
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Spanish", prompt: "setup my workspace for learning Spanish", icon: "🚗" },
                  { label: "Sugar-Free", prompt: "setup my workspace for quitting sugar", icon: "🚫" },
                  { label: "High Protein", prompt: "setup a plan to do high protein diet", icon: "🥩" },
                  { label: "Core Developer", prompt: "setup my workspace as a nextjs developer", icon: "🚀" },
                ].map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => {
                      navigator.clipboard.writeText(ex.prompt);
                      alert(`Prompt for ${ex.label} copied!`);
                    }}
                    className="w-full p-4 rounded-2xl bg-muted/40 border border-border hover:border-primary/50 hover:bg-muted/60 transition-all text-left flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{ex.icon}</span>
                      <div>
                        <p className="text-xs font-black text-foreground uppercase tracking-widest mb-1">{ex.label}</p>
                        <p className="text-[11px] text-muted-foreground italic truncate max-w-[140px] sm:max-w-[180px]">"{ex.prompt}"</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions / Navigation */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Flow Timer", icon: "⏳", color: "bg-primary/10 border-primary/20 text-primary" },
            { label: "Skill Tracks", icon: "🎯", color: "bg-accent/10 border-accent/20 text-accent" },
            { label: "Resource Hub", icon: "🔖", color: "bg-orange-500/10 border-orange-500/20 text-orange-400" },
            { label: "Biometrics", icon: "📈", color: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" },
          ].map((action, i) => (
            <motion.button
              key={i}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn("p-6 rounded-[2rem] border transition-all text-center group", action.color)}
            >
              <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">{action.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
