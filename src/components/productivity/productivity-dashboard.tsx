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
import { ShieldCheck, Sparkles, ArrowRight, TrendingUp, Zap, Target, Clock, LifeBuoy, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContextHelp } from "@/components/ui/context-help";

export function ProductivityDashboard({
  userName: initialUserName,
  ...initialStats
}: ProductivityDashboardProps) {
  const { pomodoro, challenges, userId, currentEnergy, creativeRefreshTrigger, googleProfile, persona } = useProductivity();
  const [stats, setStats] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!userId) return;
    getProductivityDashboard(userId).then(setStats);
  }, [userId, creativeRefreshTrigger]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
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
    pomodoroSessionsToday,
    challengesCompletedToday,
    totalChallenges,
    currentStreak,
  } = dashboardData;

  const userName = googleProfile?.name || persona?.name || dashboardData.userName || initialUserName || "User";

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
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1">
              <motion.h1
                className="text-4xl md:text-6xl font-black text-foreground mb-4 tracking-tighter"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              >
                {getGreeting()}{userName ? `, ${userName}` : ""}! <span className="inline-block animate-bounce-slow">✨</span>
              </motion.h1>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-2xl border border-border/50">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold tabular-nums">
                    {currentTime.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-2xl border border-border/50">
                  <Clock className="w-4 h-4 text-accent" />
                  <span className="text-sm font-semibold">
                    {currentTime.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 shadow-lg shadow-primary/5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Growth Mode: Active
              </div>
              {userId && (
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border pb-1">
                  ID: {userId.replace("up_", "")}
                </div>
              )}
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
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Flow Sessions</span>
                <ContextHelp
                  title="What is Flow?"
                  description="A period of intense focus. We use the Pomodoro technique (25 min focus + 5 min break) to help you get into the 'zone' without burning out."
                />
              </div>
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
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Skill Mastery</span>
                <ContextHelp
                  title="Mastery Tracking"
                  description="Your cumulative progress across all tracks. We track how many unique roles you're cultivating and how many challenges you've mastered."
                />
              </div>
            </div>
            <p className="text-4xl font-black text-foreground mb-1">
              {Array.from(new Set(challenges.map(c => c.role || "General"))).length}
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              {challengesCompletedToday}/{totalChallenges} tasks finished
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
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Biometric Energy</span>
                <ContextHelp
                  title="Understand Your Energy"
                  description="A scale of 1-10 reflecting your cognitive capacity. When it drops below 3, the OS switches to 'Recovery Mode' to help you recharge."
                />
              </div>
            </div>
            <p className="text-4xl font-black text-indigo-400 mb-1">
              {currentEnergy !== null ? `${currentEnergy}/10` : "--"}
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              {currentEnergy && currentEnergy <= 3 ? "Recovery mode recommended" : "Peak performance zone"}
            </p>
          </motion.div>
        </div>

        {/* Daily Wisdom & Weekend Reflection */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <motion.div
            variants={itemVariants}
            className="lg:col-span-7 xl:col-span-8 bg-gradient-to-br from-indigo-500/5 via-background to-primary/5 rounded-[2.5rem] p-6 md:p-10 lg:p-12 border border-border/50 relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Sparkles className="w-64 h-64 text-primary" />
            </div>

            <div className="relative z-10 max-w-2xl">
              {(() => {
                const day = currentTime.getDay();
                const isWeekend = day === 0 || day === 6;
                const dailyQuotes = [
                  { text: "Rest is not idleness, and to lie sometimes on the grass under trees... is by no means a waste of time.", author: "John Lubbock" }, // Sun
                  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" }, // Mon
                  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" }, // Tue
                  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" }, // Wed
                  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" }, // Thu
                  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" }, // Fri
                  { text: "The weekend is a time to reconnect with your soul and recharge your vision.", author: "Inspiration" } // Sat
                ];

                return (
                  <>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6 flex items-center gap-3">
                      <div className="w-10 h-px bg-primary/30" />
                      {isWeekend ? "Weekend Reflection" : "Daily Wisdom"}
                    </h2>

                    {isWeekend ? (
                      <div className="space-y-6">
                        <p className="text-2xl md:text-3xl font-black text-foreground leading-[1.1] tracking-tight">
                          I see you are working through the weekend. You must be working extremely hard, but remember to breathe.
                        </p>
                        <p className="text-muted-foreground text-sm md:text-base leading-relaxed font-medium bg-primary/5 p-6 rounded-2xl border-l-4 border-primary">
                          Work can wait, but your time cannot. Every week you spend grinding away now, you might regret at 60 if you didn't enjoy the journey.
                          <span className="block mt-3 text-foreground font-bold">
                            If you're working today, let it be for upskilling and personal growth—not just for others. Invest in yourself.
                          </span>
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-3xl md:text-5xl font-black text-foreground leading-none tracking-tighter mb-4">
                          "{dailyQuotes[day].text}"
                        </p>
                        <p className="text-primary font-black uppercase tracking-widest text-xs">— {dailyQuotes[day].author}</p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="lg:col-span-5 xl:col-span-4 bg-card/60 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-8 border border-border shadow-2xl flex flex-col"
          >
            <h3 className="text-[10px] font-black text-muted-foreground mb-6 md:mb-8 flex items-center gap-3 uppercase tracking-[0.3em]">
              <div className="w-2 h-2 rounded-full bg-accent" />
              Skill Momentum
            </h3>

            <div className="space-y-6 flex-1 flex flex-col justify-center">
              {[
                { label: "Track Progress", value: totalChallenges > 0 ? `${Math.round((challengesCompletedToday / totalChallenges) * 100)}%` : "0%", sub: "Completed Today", color: "bg-primary/20 text-primary" },
                { label: "Active Roles", value: Array.from(new Set(challenges.map(c => c.role || "General"))).length.toString(), sub: "Personalized Tracks", color: "bg-accent/20 text-accent" },
                { label: "Current Focus", value: challenges.find(c => !c.completed)?.title || "None", sub: "Priority Task", color: "bg-orange-500/20 text-orange-400" },
              ].map((metric) => (
                <div key={metric.label} className="group flex items-center gap-5 p-4 rounded-3xl hover:bg-muted/50 transition-all border border-transparent hover:border-border/50">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner", metric.color)}>
                    {metric.value.includes('%') ? <TrendingUp className="w-5 h-5" /> : metric.value.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1.5">{metric.label}</p>
                    <p className="text-base md:text-lg font-bold text-foreground leading-tight">{metric.value}</p>
                    <p className="text-[9px] font-medium text-muted-foreground/60 uppercase mt-0.5">{metric.sub}</p>
                  </div>
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


            {/* Quick Guides */}
            <div className="bg-card rounded-[2rem] p-8 border border-border shadow-xl">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary" />
                Initialize OS
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Spanish", prompt: "setup my workspace for learning Spanish", icon: "🥘" },
                  { label: "Sugar-Free", prompt: "setup my workspace for quitting sugar", icon: "🚫" },
                  { label: "High Protein", prompt: "setup my workspace to do high protein diet", icon: "🥩" },
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
      </motion.div>
    </div>
  );
}
