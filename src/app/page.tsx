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
  Sun,
  Loader2
} from "lucide-react";

// Creative tool imports
import { StyledDistractionJournal } from "@/components/productivity/creative/distraction-journal/styled-journal";
import { StyledCodeSnippets } from "@/components/productivity/creative/code-snippets/styled-snippets";
import { StyledStandupLog } from "@/components/productivity/creative/standup-log/styled-standup";
import { StyledEnergyMapper } from "@/components/productivity/creative/energy-mapper/styled-mapper";
import { StyledWeeklyReview } from "@/components/productivity/creative/weekly-review/styled-review";

import { Onboarding } from "@/components/auth/onboarding";
import { ProfileMenu } from "@/components/auth/profile-menu";
import { QuickSearch } from "@/components/productivity/quick-search";
import { RecoveryTools } from "@/components/productivity/recovery-tools";
import { AppOnboarding } from "@/components/ui/app-onboarding";

const GlobalLoadingOverlay = ({ isProcessingAI }: { isProcessingAI: boolean }) => {
  if (!isProcessingAI) return null;
  return (
    // Thin transparent overlay — user can see app, controls are disabled via pointer-events-none on content
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Very subtle tint — app remains readable */}
      <div className="absolute inset-0 bg-background/20" />
      {/* Glass toast pinned to top-center */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-card/70 backdrop-blur-xl border border-border/60 shadow-xl shadow-black/10">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
            <Loader2 className="w-4 h-4 text-primary animate-spin relative z-10" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/80">
            AI is working…
          </span>
        </div>
      </div>
    </div>
  );
};

function HomeContent() {
  const { activeView, setActiveView, isChatOpen, setIsChatOpen, challenges, triggerCreativeRefresh, userId, currentEnergy, confirmState, closeConfirm, lastSetupRole, setLastSetupRole, isLoadingChallenges } = useProductivity();
  const isLowEnergy = currentEnergy !== null && currentEnergy <= 3;

  const [isDarkPref, setIsDarkPref] = React.useState(false);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  // Auto switch to dark mode on low energy
  const isDark = isLowEnergy || isDarkPref;

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Seamless redirect + scroll to newly created skill track
  React.useEffect(() => {
    if (!lastSetupRole) return;
    if (isLoadingChallenges) return; // Wait until the loading state transitions to false

    // Navigate to Skills Track page
    setActiveView('skills');
    // After navigation, scroll to the newly added track (at the bottom of the page)
    const scrollTimeout = setTimeout(() => {
      // Find the last role track header (newest = last in DOM after sort)
      const allTrackHeaders = document.querySelectorAll('[data-role-track]');
      const lastTrack = allTrackHeaders[allTrackHeaders.length - 1];
      if (lastTrack) {
        lastTrack.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // Fallback: scroll to bottom of skills container
        const mainEl = document.getElementById('main-scroll');
        if (mainEl) mainEl.scrollTo({ top: mainEl.scrollHeight, behavior: 'smooth' });
      }
      setLastSetupRole(null);
    }, 100);
    return () => clearTimeout(scrollTimeout);
  }, [lastSetupRole, isLoadingChallenges, setActiveView, setLastSetupRole]);



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
      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border flex items-center justify-around h-16 px-2 safe-area-bottom">
        {[
          { id: "dashboard", icon: <LayoutDashboard className="w-5 h-5" />, label: "Home" },
          { id: "pomodoro", icon: <Timer className="w-5 h-5" />, label: "Focus" },
          { id: "skills", icon: <CheckSquare className="w-5 h-5" />, label: "Skills" },
          { id: "links", icon: <LinkIcon className="w-5 h-5" />, label: "Links" },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-xl transition-all active:scale-90",
              activeView === item.id
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {item.icon}
            <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-xl transition-all active:scale-90",
            isChatOpen ? "text-primary" : "text-muted-foreground"
          )}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Chat</span>
        </button>
      </nav>
      {/* Mobile Sidebar Overlay */}
      {showMobileMenu && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:relative z-50 h-full border-r border-border bg-card flex flex-col transition-all duration-300",
        isSidebarCollapsed ? "w-20" : "w-64",
        showMobileMenu ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className={cn("p-6 border-b border-border flex items-center justify-between", isSidebarCollapsed && "p-4 justify-center flex-col gap-4")}>
          {!isSidebarCollapsed ? (
            <>
              <div>
                <div className="flex items-center gap-2 mb-1 text-primary">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                  <h1 className="text-xl font-bold tracking-tight">TaskStack</h1>
                </div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Productivity OS</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="hidden md:block p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-90"
                  onClick={() => setIsSidebarCollapsed(true)}
                  title="Collapse Sidebar"
                >
                  <Menu className="w-4 h-4" />
                </button>
                <button
                  className="md:hidden p-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <button
                className="p-1.5 rounded-xl hover:bg-muted text-primary transition-all active:scale-90"
                onClick={() => setIsSidebarCollapsed(false)}
                title="Expand Sidebar"
              >
                <Sparkles className="w-6 h-6 animate-pulse" />
              </button>
              <button
                className="hidden md:block p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-90"
                onClick={() => setIsSidebarCollapsed(false)}
                title="Expand Sidebar"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          )}
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
                whileHover={{ x: isSidebarCollapsed ? 0 : 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveView(item.id!);
                  setShowMobileMenu(false);
                }}
                className={cn(
                  "w-full flex items-center rounded-2xl transition-all text-sm font-semibold group",
                  isSidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-4 py-3",
                  activeView === item.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                )}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  activeView === item.id ? "bg-white/20" : "bg-muted group-hover:bg-primary/10"
                )}>
                  {item.icon}
                </div>
                {!isSidebarCollapsed && item.label}
              </motion.button>
            );
          })}
        </nav>

        {!isSidebarCollapsed && (
          <div className="p-4 border-t border-border space-y-2">
            <ApiKeyCheck>
              <></>
            </ApiKeyCheck>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main 
        id="main-scroll"
        className={cn(
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
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground hidden lg:block">
              {navItems.find(i => i.id === activeView)?.label || "Dashboard"}
            </h2>
          </div>

          <div className="flex-1 flex justify-center max-w-xl px-4">
            <QuickSearch />
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
                <span className="hidden sm:inline">Energy: {currentEnergy}/10</span>
                <span className="sm:hidden">{currentEnergy}/10</span>
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
          className="p-3 pb-20 md:p-8 md:pb-8 max-w-7xl mx-auto"
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

      {/* Global Confirmation Modal */}
      <AnimatePresence>
        {confirmState.isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 isolate">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeConfirm}
              className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-card border border-border/80 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] rounded-[3rem] p-8 text-center"
            >
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner",
                confirmState.type === "danger" ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"
              )}>
                <AlertOctagon className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">{confirmState.title}</h3>
              <div className="text-sm font-medium text-muted-foreground mb-10 leading-relaxed px-2">
                {confirmState.message}
              </div>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={async () => {
                    await confirmState.onConfirm();
                    closeConfirm();
                  }}
                  className={cn(
                    "w-full py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] transition-all shadow-2xl active:scale-[0.98] outline-none",
                    confirmState.type === "danger" 
                      ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20" 
                      : "bg-foreground hover:bg-foreground/90 text-background shadow-foreground/10"
                  )}
                >
                  {confirmState.confirmText || "Confirm"}
                </button>
                <button
                  onClick={closeConfirm}
                  className="w-full py-5 bg-slate-100 hover:bg-slate-200 dark:bg-muted/50 dark:hover:bg-muted text-muted-foreground rounded-[2rem] font-black uppercase tracking-widest text-[11px] transition-all active:scale-[0.98] outline-none border border-border/50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* First-time Tutorial Onboarding */}
      <AppOnboarding />
    </div>
  );
}


const TamboProviderWithContext = () => {
  const { triggerCreativeRefresh, userId, isProcessingAI, setIsProcessingAI, setLastSetupRole } = useProductivity();

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
          setIsProcessingAI(true);
          try {
            const res = await (t.tool as any)(userId, ...args);
            triggerCreativeRefresh();
            // After workspace setup, trigger seamless redirect to skill track
            if (t.name === 'setupPersonalizedWorkspace' && res?.success) {
              const skill = args[0]?.skill || args[0];
              if (skill) setLastSetupRole(typeof skill === 'string' ? skill : skill.skill || '');
            }
            return res;
          } finally {
            setIsProcessingAI(false);
          }
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
      {/* App dims slightly and loses interactivity while AI works — overlay handles the visual */}
      <div className={cn("transition-all duration-300", isProcessingAI && "pointer-events-none opacity-60 select-none")}>
        <HomeContent />
      </div>
      <GlobalLoadingOverlay isProcessingAI={isProcessingAI} />
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
