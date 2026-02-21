"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

import { ApiKeyCheck } from "@/components/ApiKeyCheck";
import { ProductivityDashboard } from "@/components/productivity/productivity-dashboard";
import { PomodoroTimer } from "@/components/productivity/pomodoro-timer";
import { InteractableSkillTracker } from "@/components/productivity/skill-tracker";
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
  Sparkles,
  Menu,
  XIcon,
  Moon,
  Sun
} from "lucide-react";

// Creative tool imports
import { StyledDistractionJournal } from "@/components/productivity/creative/distraction-journal/styled-journal";
import { StyledCodeSnippets } from "@/components/productivity/creative/code-snippets/styled-snippets";
import { StyledStandupLog } from "@/components/productivity/creative/standup-log/styled-standup";
import { StyledEnergyMapper } from "@/components/productivity/creative/energy-mapper/styled-mapper";
import { StyledWeeklyReview } from "@/components/productivity/creative/weekly-review/styled-review";

import { Onboarding } from "@/components/auth/onboarding";
import { ProfileMenu } from "@/components/auth/profile-menu";
import { RecoveryTools } from "@/components/productivity/recovery-tools";

function HomeContent() {
  const { activeView, setActiveView, isChatOpen, setIsChatOpen, challenges, triggerCreativeRefresh, userId, currentEnergy } = useProductivity();
  const isLowEnergy = currentEnergy !== null && currentEnergy <= 3;

  const [isDarkPref, setIsDarkPref] = React.useState(false);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

  // Auto switch to dark mode on low energy
  const isDark = isLowEnergy || isDarkPref;

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Auto-open chat for new users to guide onboarding
  React.useEffect(() => {
    if (userId && challenges.length === 0 && !isChatOpen) {
      setIsChatOpen(true);
    }
  }, [userId, challenges.length, setIsChatOpen, isChatOpen]);

  if (!userId) {
    return <Onboarding />;
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "pomodoro", label: "Pomodoro", icon: <Timer className="w-4 h-4" /> },
    { id: "skills", label: "Skills Track", icon: <CheckSquare className="w-4 h-4" /> },
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
      "flex h-screen overflow-hidden transition-colors duration-1000 relative",
      isLowEnergy ? "bg-black" : "bg-background"
    )}>
      {/* Mobile Sidebar Overlay */}
      {showMobileMenu && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:relative z-50 w-64 h-full border-r border-border bg-card flex flex-col transition-transform duration-300",
        showMobileMenu ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1 text-primary">
              <Sparkles className="w-6 h-6" />
              <h1 className="text-xl font-bold tracking-tight">TaskStack</h1>
            </div>
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Productivity OS</p>
          </div>
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowMobileMenu(false)}
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {navItems.map((item, idx) => {
            if (item.separator) return <motion.div key={`sep-${idx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-px bg-border/50 my-6 mx-2" />;
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveView(item.id!);
                  setShowMobileMenu(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-semibold group",
                  activeView === item.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  activeView === item.id ? "bg-white/20" : "bg-muted group-hover:bg-primary/10"
                )}>
                  {item.icon}
                </div>
                {item.label}
              </motion.button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">

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
        "flex-1 overflow-y-auto overflow-x-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] relative",
        isChatOpen ? "xl:mr-[400px]" : "mr-0"
      )}>
        <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowMobileMenu(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              {navItems.find(i => i.id === activeView)?.label || "Dashboard"}
            </h2>
          </div>
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
            <button onClick={() => setIsDarkPref(!isDarkPref)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <ProfileMenu />
          </div>
        </header>

        <motion.div
          key={activeView + (isLowEnergy ? "-low" : "-normal")}
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="p-4 md:p-8 max-w-7xl mx-auto"
        >
          {activeView === "dashboard" && (
            isLowEnergy ? <RecoveryTools /> : <ProductivityDashboard />
          )}
          {activeView === "pomodoro" && (
            <div className="py-12 flex items-center justify-center">
              <PomodoroTimer />
            </div>
          )}
          {activeView === "skills" && (
            <div className="py-12 flex justify-center">
              <InteractableSkillTracker />
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
        </motion.div>
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
      "getProductivityDashboard", "getChallenges", "getSavedLinks", "getInspirationalQuote",
      "getPomodoroStats", "startPomodoroSession", "toggleChallenge", "saveChallenge", "deleteChallenge",
      "saveLink", "updateLink", "deleteLink", "logDistraction", "getDistractions",
      "saveSnippet", "getSnippets", "updateSnippet", "deleteSnippet", "saveStandupEntry",
      "logEnergyLevel", "getEnergyData", "saveWeeklyReview", "getWeeklyReviews",
      "togglePracticedRule", "saveQuote", "updateQuote", "deleteQuote",
      "seedProductivityData", "setupPersonalizedWorkspace", "generateChallengeDetails"
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
