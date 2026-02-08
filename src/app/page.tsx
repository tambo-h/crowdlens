"use client";

import React from "react";

import { ApiKeyCheck } from "@/components/ApiKeyCheck";
import { ProductivityDashboard } from "@/components/productivity/productivity-dashboard";
import { PomodoroTimer } from "@/components/productivity/pomodoro-timer";
import { InteractableHabitTracker } from "@/components/productivity/habit-tracker";
import { InspirationQuote } from "@/components/productivity/inspiration-quote";
import { LinkCard } from "@/components/productivity/link-card";
import { ProductivityRules } from "@/components/productivity/productivity-rules";
import { ChatSidePanel } from "@/components/tambo/chat-side-panel";
import { ProductivityProvider, useProductivity } from "@/context/productivity-context";
import { components, tools } from "@/lib/tambo";
import { TamboProvider } from "@tambo-ai/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Timer,
  CheckSquare,
  Link as LinkIcon,
  Lightbulb,
  BookOpen,
  Search,
  Bell,
  Settings,
  AlertOctagon,
  FileCode,
  MessageSquare,
  Activity,
  CalendarDays,
  Sparkles
} from "lucide-react";

// Creative tool imports
import { StyledDistractionJournal } from "@/components/productivity/creative/distraction-journal/styled-journal";
import { StyledCodeSnippets } from "@/components/productivity/creative/code-snippets/styled-snippets";
import { StyledStandupLog } from "@/components/productivity/creative/standup-log/styled-standup";
import { StyledEnergyMapper } from "@/components/productivity/creative/energy-mapper/styled-mapper";
import { StyledWeeklyReview } from "@/components/productivity/creative/weekly-review/styled-review";

import { Onboarding } from "@/components/auth/onboarding";
import { RecoveryTools } from "@/components/productivity/recovery-tools";

function HomeContent() {
  const { activeView, setActiveView, isChatOpen, triggerCreativeRefresh, userId, currentEnergy } = useProductivity();
  const isLowEnergy = currentEnergy !== null && currentEnergy <= 3;

  if (!userId) {
    return <Onboarding />;
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "pomodoro", label: "Pomodoro", icon: <Timer className="w-4 h-4" /> },
    { id: "habits", label: "Habits", icon: <CheckSquare className="w-4 h-4" /> },
    { id: "links", label: "Links", icon: <LinkIcon className="w-4 h-4" /> },
    { id: "inspiration", label: "Inspiration", icon: <Lightbulb className="w-4 h-4" /> },
    { id: "rules", label: "Rules", icon: <BookOpen className="w-4 h-4" /> },
    { separator: true },
    { id: "journal", label: "Distractions", icon: <AlertOctagon className="w-4 h-4" /> },
    { id: "snippets", label: "Snippets", icon: <FileCode className="w-4 h-4" /> },
    { id: "standup", label: "Standup", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "energy", label: "Energy", icon: <Activity className="w-4 h-4" /> },
    { id: "review", label: "Weekly Review", icon: <CalendarDays className="w-4 h-4" /> },
  ];

  return (
    <div className={cn(
      "flex h-screen overflow-hidden transition-colors duration-1000",
      isLowEnergy ? "bg-[#020617]" : "bg-background"
    )}>
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2 mb-1 text-primary">
            <Sparkles className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">TaskStack</h1>
          </div>
          <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Productivity OS</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item, idx) => {
            if (item.separator) return <div key={`sep-${idx}`} className="h-px bg-border my-4 mx-2" />;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id!)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium",
                  activeView === item.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <button
            onClick={async () => {
              if (!userId) return;
              const { seedProductivityData } = await import("@/services/productivity-service");
              await seedProductivityData(userId);
              triggerCreativeRefresh();
              alert("Guest data seeded! Habits, links, and rules reset.");
            }}
            className="w-full py-2 px-3 rounded-lg border border-dashed border-primary/30 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
          >
            🌱 Seed Guest Data
          </button>

          <ApiKeyCheck>
            <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Tambo AI</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Ready to boost your productivity</p>
            </div>
          </ApiKeyCheck>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 overflow-y-auto transition-all duration-500 ease-in-out",
        isChatOpen ? "mr-[30%]" : "mr-0"
      )}>
        <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            {navItems.find(i => i.id === activeView)?.label || "Dashboard"}
          </h2>
          <div className="flex items-center gap-4">
            {currentEnergy !== null && (
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all duration-700",
                isLowEnergy
                  ? "bg-red-500/20 border-red-500/50 text-red-400 animate-pulse"
                  : "bg-primary/10 border-primary/20 text-primary"
              )}>
                <Activity className="w-3 h-3" />
                <span>Energy: {currentEnergy}/10</span>
              </div>
            )}
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20" />
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto">
          {activeView === "dashboard" && (
            isLowEnergy ? <RecoveryTools /> : <ProductivityDashboard />
          )}
          {activeView === "pomodoro" && (
            <div className="py-12 flex items-center justify-center">
              <PomodoroTimer />
            </div>
          )}
          {activeView === "habits" && (
            <div className="py-12 flex justify-center">
              <InteractableHabitTracker />
            </div>
          )}
          {activeView === "links" && (
            <div className="py-12 flex justify-center">
              <LinkCard viewMode="cards" />
            </div>
          )}
          {activeView === "inspiration" && (
            <div className="py-12 flex justify-center">
              <InspirationQuote />
            </div>
          )}
          {activeView === "rules" && (
            <div className="py-12 flex justify-center">
              <ProductivityRules />
            </div>
          )}

          {/* Creative Views */}
          {activeView === "journal" && <StyledDistractionJournal showAnalytics={false} />}
          {activeView === "snippets" && <StyledCodeSnippets />}
          {activeView === "standup" && <StyledStandupLog />}
          {activeView === "energy" && <StyledEnergyMapper />}
          {activeView === "review" && <StyledWeeklyReview />}
        </div>
      </main>

      {/* Chat Side Panel */}
      <ChatSidePanel />
    </div>
  );
}


const TamboProviderWithContext = () => {
  const { triggerCreativeRefresh, userId } = useProductivity();

  const augmentedTools = React.useMemo(() => tools.map(t => {
    // All tools that take (userId, input) should be wrapped
    const userIdTools = [
      "getProductivityDashboard", "getHabits", "getSavedLinks", "getInspirationalQuote",
      "getPomodoroStats", "startPomodoroSession", "toggleHabit", "saveHabit", "saveLink",
      "logDistraction", "getDistractions", "saveSnippet", "getSnippets", "saveStandupEntry",
      "logEnergyLevel", "getEnergyData", "saveWeeklyReview", "getWeeklyReviews",
      "togglePracticedRule", "saveQuote", "seedProductivityData"
    ];

    if (userIdTools.includes(t.name)) {
      return {
        ...t,
        tool: async (...args: any[]) => {
          if (!userId) {
            console.error("User not logged in, cannot call tool:", t.name);
            return { error: "Please log in first." };
          }
          // Inject userId as first argument
          const res = await (t.tool as any)(userId, ...args);
          triggerCreativeRefresh();
          return res;
        }
      };
    }
    return t;
  }), [triggerCreativeRefresh, userId]);

  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={components}
      tools={augmentedTools}
      tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
    >
      <HomeContent />
    </TamboProvider>
  );
};

export default function Home() {
  return (
    <ProductivityProvider>
      <TamboProviderWithContext />
    </ProductivityProvider>
  );
}
