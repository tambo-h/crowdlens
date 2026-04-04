/**
 * @file skill-tracker.tsx
 * @description Tambo generative and interactable component for skill and challenge tracking
 */

"use client";

import { z } from "zod";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { withInteractable } from "@tambo-ai/react";
import { useProductivity } from "@/context/productivity-context";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, ExternalLink, Plus, BookOpen, Sparkles, Trash2, Edit2, X, Check, AlertOctagon, Calendar, Clock, AlertCircle, Info } from "lucide-react";
import { ContextHelp } from "@/components/ui/context-help";
import { cn } from "@/lib/utils";

export const skillTrackerSchema = z.object({
  challenges: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      completed: z.boolean(),
      role: z.string(),
      steps: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          completed: z.boolean(),
          deadline: z.string().optional(),
        })
      ),
    })
  ).default([]).describe("List of challenges to track and manage."),
});

export type SkillTrackerProps = z.input<typeof skillTrackerSchema>;

export function SkillTracker({ challenges: challengesByAI = [] }: SkillTrackerProps) {
  const {
    challenges,
    toggleChallenge,
    saveChallenge,
    updateChallenge,
    deleteChallenge,
    isLoadingChallenges,
    userId,
    expandChallengeDetails,
    abortExpansion,
    expandingIds,
    addChallengeStep,
    updateChallengeStep,
    deleteChallengeStep,
    deleteRoleTrack,
    trackDeadlines,
    setTrackDeadline,
    expandedId,
    setExpandedId,
    collapsedRoles,
    setCollapsedRoles,
    openConfirm,
    closeConfirm
  } = useProductivity();
  const [isAddingInRole, setIsAddingInRole] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  // Persistent expansion state
  useEffect(() => {
    const saved = sessionStorage.getItem("taskstack_expanded_id");
    if (saved) setExpandedId(saved);
  }, []);

  const handleSetExpandedId = (id: string | null) => {
    // If expanding, save the scroll position before setting expandedId
    if (id) {
      const container = document.getElementById("main-scroll-container");
      if (container) {
        sessionStorage.setItem("taskstack_scroll_top", container.scrollTop.toString());
      }
      sessionStorage.setItem("taskstack_expanded_id", id);
    } else {
      sessionStorage.removeItem("taskstack_expanded_id");
      sessionStorage.removeItem("taskstack_scroll_top");
    }
    setExpandedId(id);
  };

  // Scroll into view when AI expansion finishes OR component re-mounts
  useEffect(() => {
    // 1. Initial mount or re-mount (e.g. data refresh)
    const savedId = sessionStorage.getItem("taskstack_expanded_id");
    const savedScroll = sessionStorage.getItem("taskstack_scroll_top");
    
    if (savedId) {
      // Use small delays to wait for layout shifts to complete
      setTimeout(() => {
        const container = document.getElementById("main-scroll-container");
        const el = document.querySelector(`[data-task-id="${savedId}"]`);
        
        if (container && savedScroll) {
          // Precise restoration of pixel position
          container.scrollTop = parseInt(savedScroll, 10);
        } else if (el) {
          // Fallback to scrolling task into view if pixel position is not available
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [challenges]); // Re-run when data refreshes

  // Scroll specifically when expansion state changes
  useEffect(() => {
    // If we were expanding and now we've finished
    if (expandedId && !expandingIds.includes(expandedId)) {
      const el = document.querySelector(`[data-task-id="${expandedId}"]`);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    }
  }, [expandingIds, expandedId]);

  const [editingChallengeId, setEditingChallengeId] = useState<string | null>(null);
  const [editingChallengeTitle, setEditingChallengeTitle] = useState("");

  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editingStepTitle, setEditingStepTitle] = useState("");

  const [addingResourceTo, setAddingResourceTo] = useState<string | null>(null);
  const [newResourceTitle, setNewResourceTitle] = useState("");
  const [newResourceUrl, setNewResourceUrl] = useState("");

  const [addingStepTo, setAddingStepTo] = useState<string | null>(null);
  const [newStepTitle, setNewStepTitle] = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const didInitRef = useRef(false);

  const [editingDeadlineId, setEditingDeadlineId] = useState<string | null>(null);
  const [tempDeadline, setTempDeadline] = useState("");
  const [editingStepDeadlineId, setEditingStepDeadlineId] = useState<string | null>(null);
  const [stepTempDeadline, setStepTempDeadline] = useState("");

  // Initialize collapsed states once when challenges load
  useEffect(() => {
    if (didInitRef.current || challenges.length === 0) return;
    
    const savedExpandedId = sessionStorage.getItem("taskstack_expanded_id");
    const expandedChallenge = challenges.find(c => c.id === savedExpandedId);
    const expandedRole = expandedChallenge?.role || "General";

    const roles = Array.from(new Set(challenges.map(c => c.role || "General")));
    if (roles.length > 1) {
      // Keep only the first one expanded, UNLESS another one contains the expanded task
      setCollapsedRoles(roles.filter(r => r !== roles[0] && r !== expandedRole));
    }
    didInitRef.current = true;
  }, [challenges, setCollapsedRoles]);

  // Ensure expanded task's role is never collapsed
  useEffect(() => {
    if (expandedId) {
      const challenge = challenges.find(c => c.id === expandedId);
      const role = challenge?.role || "General";
      if (collapsedRoles.includes(role)) {
        setCollapsedRoles(prev => prev.filter(r => r !== role));
      }
    }
  }, [expandedId, challenges]);

  // Deadline status helper
  const getDeadlineStatus = (deadline?: string) => {
    if (!deadline) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dl = new Date(deadline + 'T00:00:00');
    const diffDays = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: `${Math.abs(diffDays)}d overdue`, color: 'text-rose-500 bg-rose-500/10 border-rose-500/30 font-black shadow-[0_2px_10px_-2px_rgba(244,63,94,0.2)]', icon: '🔴' };
    if (diffDays <= 2) return { label: diffDays === 0 ? 'Due today' : `${diffDays}d left`, color: 'text-orange-500 bg-orange-500/10 border-orange-500/30 font-black shadow-[0_2px_10px_-2px_rgba(249,115,22,0.2)]', icon: '🟡' };
    return { label: `${diffDays}d left`, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30 font-black shadow-[0_2px_10px_-2px_rgba(16,185,129,0.1)]', icon: '🟢' };
  };

  const formatDeadlineDate = (deadline?: string) => {
    if (!deadline) return '';
    return new Date(deadline + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const toggleCollapse = (role: string) => {
    setCollapsedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const saveDeadline = async (id: string, deadline: string) => {
    if (!updateChallenge) return;
    await updateChallenge(id, { deadline });
    setEditingDeadlineId(null);
  };

  const handleExpand = (challenge: any) => {
    const isExpanding = expandedId !== challenge.id;
    handleSetExpandedId(isExpanding ? challenge.id : null);

    if (isExpanding && challenge.steps.length === 0 && (!challenge.resources || challenge.resources.length === 0)) {
      expandChallengeDetails(challenge.id);
    }
  };

  if (isLoadingChallenges) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-lg border border-border max-w-2xl w-full text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">Loading your skills...</p>
      </div>
    );
  }

  // Group challenges by role
  const groups = challenges.reduce((acc: Record<string, any[]>, c) => {
    const r = c.role || "General";
    if (!acc[r]) acc[r] = [];
    acc[r].push(c);
    return acc;
  }, {});

  // Sort roles by the minimum challenge order — oldest track first, newest at bottom
  const sortedRoles = Object.keys(groups).sort((a, b) => {
    const minA = Math.min(...groups[a].map((c: any) => c.order));
    const minB = Math.min(...groups[b].map((c: any) => c.order));
    return minA - minB;
  });

  const handleAdd = async (role: string) => {
    if (!newTitle.trim() || !userId) return;

    await saveChallenge({
      title: newTitle.trim(),
      role,
      completed: false,
      steps: [],
      resources: [],
      order: sortedRoles.indexOf(role) * 100 + (groups[role]?.length || 0)
    });

    setIsAddingInRole(null);
    setNewTitle("");
  };

  const handleDeleteMainTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    openConfirm({
      title: "Delete Challenge?",
      message: "This will permanently remove this challenge and all its action steps.",
      confirmText: "Delete Task",
      onConfirm: async () => {
        if (deleteChallenge) await deleteChallenge(id);
      }
    });
  };

  const handleStartEditMainTask = (challenge: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChallengeId(challenge.id);
    setEditingChallengeTitle(challenge.title);
  };

  const handleSaveMainTask = async (challenge: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingChallengeTitle.trim() && updateChallenge) {
      await updateChallenge(challenge.id, { title: editingChallengeTitle });
    }
    setEditingChallengeId(null);
  };

  const handleSaveStep = async (challenge: any, stepId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingStepTitle.trim() && updateChallengeStep) {
      await updateChallengeStep(challenge.id, stepId, { title: editingStepTitle.trim() });
    }
    setEditingStepId(null);
  };

  const handleAddStep = async (challengeId: string) => {
    if (!newStepTitle.trim() || !addChallengeStep) return;
    const title = newStepTitle.trim();
    setAddingStepTo(null);
    setNewStepTitle("");
    await addChallengeStep(challengeId, title);
  };

  const handleDeleteStep = async (challengeId: string, stepId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteChallengeStep) {
      await deleteChallengeStep(challengeId, stepId);
    }
  };

  const handleAddResource = async (challenge: any, e: React.FormEvent) => {
    e.preventDefault();
    if (!newResourceUrl.trim() || !updateChallenge) return;
    const resources = challenge.resources || [];
    await updateChallenge(challenge.id, {
      resources: [...resources, { title: newResourceTitle || newResourceUrl, url: newResourceUrl }]
    });
    setAddingResourceTo(null);
    setNewResourceTitle("");
    setNewResourceUrl("");
  };

  const handleDeleteResource = async (challenge: any, url: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openConfirm({
      title: "Remove Resource?",
      message: "Are you sure you want to remove this learning resource? You can add it back later if needed.",
      confirmText: "Remove",
      onConfirm: async () => {
        if (updateChallenge) {
          const resources = challenge.resources.filter((r: any) => r.url !== url);
          await updateChallenge(challenge.id, { resources });
        }
      }
    });
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="max-w-4xl w-full space-y-8 pb-12">
      {/* Today's Date Header */}
      <div className="flex items-center justify-between px-4 sm:px-0">
        <div>
          <h2 className="text-2xl font-black tracking-tighter text-foreground flex items-center gap-2">
             Skill Track
             <ContextHelp 
               title="What is a Skill Track?" 
               description="Your AI-generated growth roadmap. It breaks down complex roles into manageable milestones and concrete action steps." 
             />
          </h2>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-[0.2em]">{today}</p>
        </div>
      </div>

      {sortedRoles.length === 0 ? (
        <div className="bg-card rounded-2xl p-12 border border-border text-center shadow-xl">
          <span className="text-6xl block mb-4">💡</span>
          <p className="text-muted-foreground font-medium">No skills tracked yet.</p>
          <p className="text-sm text-muted-foreground mt-2">Describe your role in the chat to generate a personalized skill track!</p>
        </div>
      ) : (
        sortedRoles.map(role => {
          const roleChallenges = groups[role];
          const completedCount = roleChallenges.filter(c => c.completed).length;
          const progress = (completedCount / (roleChallenges.length || 1)) * 100;
          const isCollapsed = collapsedRoles.includes(role);

          return (
            <div
              key={role}
              id={`track-${role.toLowerCase().replace(/\s+/g, '-')}`}
              data-role-track={role}
              className="glass-panel rounded-2xl border border-border/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xl"
            >
              {/* Progress Banner */}
              <div
                className="bg-primary/5 px-6 py-4 border-b border-border/50 flex justify-between items-center group/track cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => toggleCollapse(role)}
              >
                <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                      <span className="w-2 h-6 bg-primary rounded-full transition-all group-hover/track:scale-y-125" />
                      {role} Track
                      <ContextHelp 
                        title="Dynamic Strategies" 
                        description="The AI dynamically calculates the best way to approach this specific challenge based on the current date and your experience level."
                      />
                    </h2>
                    {trackDeadlines[role] && (
                      <div className="flex items-center gap-2 ml-4">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          Target: {formatDeadlineDate(trackDeadlines[role])}
                        </span>
                        {(() => {
                          const status = getDeadlineStatus(trackDeadlines[role]);
                          return status ? (
                            <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${status.color}`}>
                              {status.label}
                            </span>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openConfirm({
                        title: "Delete Skill Track?",
                        message: (
                          <>
                            Are you sure you want to delete the <span className="font-bold text-foreground">"{role}"</span> track? 
                            This will remove everything and cannot be undone.
                          </>
                        ),
                        confirmText: "Destroy Track",
                        onConfirm: async () => {
                          if (deleteRoleTrack) await deleteRoleTrack(role);
                        }
                      });
                    }}
                    className="p-2 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/track:opacity-100 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all rounded-lg"
                    title="Delete entire track"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex flex-col items-end gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mastery</span>
                    <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                  <div className="bg-background/50 border border-border px-3 py-1.5 rounded-lg">
                    <span className="text-sm font-black text-primary">{completedCount}/{roleChallenges.length}</span>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">Challenges</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsAddingInRole(isAddingInRole === role ? null : role);
                          }}
                          className="p-2 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {isAddingInRole === role && (
                        <div className="mb-6 p-4 bg-muted/50 rounded-xl border border-dashed border-primary/30 animate-in zoom-in-95 duration-200">
                          <input
                            autoFocus
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder={`Add a new ${role} skill...`}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd(role)}
                          />
                        </div>
                      )}

                      <div className="space-y-3">
                        {roleChallenges.map((challenge) => (
                          <div
                            key={challenge.id}
                            data-task-id={challenge.id}
                            className={`group border rounded-xl transition-all duration-300 relative ${
                                challenge.completed 
                                  ? "bg-muted/10 border-border opacity-70" 
                                  : expandedId === challenge.id
                                    ? "bg-background border-primary/50 shadow-xl shadow-primary/5 ring-1 ring-primary/20"
                                    : "bg-background/80 border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 backdrop-blur-sm"
                               }`}
                          >
                            <div className="p-4 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-4 flex-1">
                                <button
                                  onClick={() => toggleChallenge(challenge.id, !challenge.completed)}
                                  className={`flex-shrink-0 transition-all duration-300 transform active:scale-75 ${challenge.completed ? "text-primary shadow-lg shadow-primary/20" : "text-border hover:text-primary"}`}
                                >
                                  {challenge.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                                </button>

                                <div className="flex-1 cursor-pointer" onClick={() => handleExpand(challenge)}>
                                  {editingChallengeId === challenge.id ? (
                                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                      <input
                                        autoFocus
                                        value={editingChallengeTitle}
                                        onChange={e => setEditingChallengeTitle(e.target.value)}
                                        className="flex-1 bg-background border border-primary px-2 py-1 rounded text-sm w-full"
                                        onKeyDown={e => e.key === 'Enter' && handleSaveMainTask(challenge, e as any)}
                                      />
                                      <button onClick={(e) => handleSaveMainTask(challenge, e)} className="p-1 hover:bg-muted text-green-500 rounded"><Check className="w-4 h-4" /></button>
                                      <button onClick={() => setEditingChallengeId(null)} className="p-1 hover:bg-muted text-red-500 rounded"><X className="w-4 h-4" /></button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between group/title">
                                      <h3 className={`font-bold text-base transition-all ${challenge.completed ? "line-through text-muted-foreground" : "text-foreground group-hover:text-primary"}`}>
                                        {challenge.title}
                                      </h3>
                                      <div className="opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/title:opacity-100 transition-opacity flex gap-1 bg-background/50 rounded-lg p-1 border border-border pb-2">
                                        <button onClick={(e) => handleStartEditMainTask(challenge, e)} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors" title="Edit challenge"><Edit2 className="w-4 h-4" /></button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setConfirmDeleteId(challenge.id);
                                          }}
                                          className="p-1.5 hover:bg-red-500/10 rounded-md text-muted-foreground hover:text-red-500 transition-colors"
                                          title="Delete challenge"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Confirmation Overlay */}
                                  <AnimatePresence>
                                    {confirmDeleteId === challenge.id && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute inset-0 bg-background/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4 rounded-xl border-2 border-red-500/20 shadow-2xl"
                                        onClick={e => e.stopPropagation()}
                                      >
                                        <div className="bg-red-500/10 p-2 rounded-full mb-2">
                                          <AlertOctagon className="w-5 h-5 text-red-500" />
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-3">Delete Permanently?</p>
                                        <div className="flex gap-2 w-full max-w-[200px]">
                                          <button
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              if (deleteChallenge) await deleteChallenge(challenge.id);
                                              setConfirmDeleteId(null);
                                            }}
                                            className="flex-1 bg-red-500 text-white text-[10px] font-black uppercase h-8 rounded-lg hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                                          >
                                            Confirm
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setConfirmDeleteId(null);
                                            }}
                                            className="flex-1 bg-muted text-foreground text-[10px] font-black uppercase h-8 rounded-lg hover:bg-border transition-colors"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>

                                  {challenge.steps.length > 0 && editingChallengeId !== challenge.id && (
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      <div className="flex -space-x-1">
                                        {challenge.steps.slice(0, 3).map((_step: any, i: number) => (
                                          <div key={i} className={`w-1.5 h-1.5 rounded-full border border-background ${challenge.steps[i].completed ? "bg-primary" : "bg-muted-foreground/30"}`} />
                                        ))}
                                      </div>
                                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        {challenge.steps.filter((s: any) => s.completed).length}/{challenge.steps.length} Steps
                                      </span>
                                      {challenge.deadline && !challenge.completed && (() => {
                                        const status = getDeadlineStatus(challenge.deadline);
                                        return status ? (
                                          <div className="relative">
                                            {editingDeadlineId === challenge.id ? (
                                              <input
                                                type="date"
                                                autoFocus
                                                value={tempDeadline || challenge.deadline}
                                                onChange={(e) => {
                                                  setTempDeadline(e.target.value);
                                                  saveDeadline(challenge.id, e.target.value);
                                                }}
                                                onBlur={() => setEditingDeadlineId(null)}
                                                className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border bg-background border-primary text-primary outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                                              />
                                            ) : (
                                              <button 
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setEditingDeadlineId(challenge.id);
                                                  setTempDeadline(challenge.deadline);
                                                }}
                                                className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border flex items-center gap-1 hover:brightness-110 active:scale-95 transition-all ${status.color}`}
                                              >
                                                <Clock className="w-2.5 h-2.5" />
                                                {formatDeadlineDate(challenge.deadline)} · {status.label}
                                              </button>
                                            )}
                                          </div>
                                        ) : null;
                                      })()}
                                    </div>
                                  )}
                                  {challenge.deadline && challenge.steps.length === 0 && editingChallengeId !== challenge.id && !challenge.completed && (() => {
                                    const status = getDeadlineStatus(challenge.deadline);
                                    return status ? (
                                      <div className="mt-1">
                                        {editingDeadlineId === challenge.id ? (
                                          <input
                                            type="date"
                                            autoFocus
                                            value={tempDeadline || challenge.deadline}
                                            onChange={(e) => {
                                              setTempDeadline(e.target.value);
                                              saveDeadline(challenge.id, e.target.value);
                                            }}
                                            onBlur={() => setEditingDeadlineId(null)}
                                            className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border bg-background border-primary text-primary outline-none focus:ring-2 focus:ring-primary/20"
                                          />
                                        ) : (
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingDeadlineId(challenge.id);
                                              setTempDeadline(challenge.deadline);
                                            }}
                                            className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border flex items-center gap-1 w-fit hover:brightness-110 active:scale-95 transition-all ${status.color}`}
                                          >
                                            <Clock className="w-2.5 h-2.5" />
                                            {formatDeadlineDate(challenge.deadline)} · {status.label}
                                          </button>
                                        )}
                                      </div>
                                    ) : null;
                                  })()}
                                  {expandingIds.includes(challenge.id) && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <div className="animate-spin w-3 h-3 border-2 border-primary border-t-transparent rounded-full" />
                                      <span className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">Strategizing...</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={() => handleExpand(challenge)}
                                className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                              >
                                {expandedId === challenge.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </button>
                            </div>

                            <AnimatePresence>
                              {expandedId === challenge.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden border-t border-border bg-muted/5 px-4 sm:px-12 pb-5 pt-2 relative"
                                >
                                  {expandingIds.includes(challenge.id) ? (
                                    <div className="py-12 text-center flex flex-col items-center justify-center min-h-[200px] relative">
                                      {/* Cancel Button */}
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          abortExpansion(challenge.id);
                                        }}
                                        className="absolute top-0 right-0 p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all group/cancel"
                                        title="Cancel AI request"
                                      >
                                        <X className="w-5 h-5 transition-transform group-hover/cancel:rotate-90" />
                                      </button>

                                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4" />
                                      <p className="text-sm font-bold text-foreground">AI Strategy Loading...</p>
                                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2">Personalizing your growth track</p>
                                      
                                      <button 
                                        onClick={() => abortExpansion(challenge.id)}
                                        className="mt-6 px-4 py-1.5 rounded-full border border-border text-[10px] font-black uppercase tracking-[0.2em] hover:bg-muted transition-all"
                                      >
                                        Cancel Request
                                      </button>
                                    </div>
                                  ) : (
                                    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[200px]">
                                    <>
                                      <div className="flex items-center justify-between mt-4 mb-2">
                                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Breakdown</h4>
                                        <button
                                          onClick={() => setAddingStepTo(addingStepTo === challenge.id ? null : challenge.id)}
                                          className="text-[10px] flex items-center gap-1 font-bold text-primary hover:text-primary/80 uppercase tracking-widest"
                                        >
                                          {addingStepTo === challenge.id ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                          {addingStepTo === challenge.id ? "Cancel" : "Add Step"}
                                        </button>
                                      </div>

                                      {addingStepTo === challenge.id && (
                                        <motion.div
                                          initial={{ opacity: 0, y: -10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          className="mb-4 flex gap-2"
                                        >
                                          <input
                                            autoFocus
                                            value={newStepTitle}
                                            onChange={e => setNewStepTitle(e.target.value)}
                                            placeholder="What needs to be done?"
                                            className="flex-1 bg-background border border-primary/30 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary/50"
                                            onKeyDown={e => e.key === 'Enter' && handleAddStep(challenge.id)}
                                          />
                                          <button
                                            onClick={() => handleAddStep(challenge.id)}
                                            className="bg-primary text-primary-foreground px-4 rounded-lg text-xs font-bold hover:opacity-90 active:scale-95 transition-all"
                                          >
                                            Add
                                          </button>
                                        </motion.div>
                                      )}

                                      {challenge.steps.length > 0 ? (
                                        <div className="space-y-2">
                                          {challenge.steps.map((step: any) => (
                                            <div
                                              key={step.id}
                                              className="flex items-center justify-between text-sm group/step py-1.5 px-3 rounded-lg hover:bg-background/50 transition-colors border border-transparent hover:border-border/50"
                                            >
                                              <div
                                                className="flex items-center gap-3 cursor-pointer flex-1"
                                                onClick={() => toggleChallenge(challenge.id, undefined, step.id)}
                                              >
                                                <div className={`transition-all duration-300 ${step.completed ? "text-primary scale-110" : "text-muted-foreground group-hover/step:text-primary"}`}>
                                                  {step.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                                </div>

                                                {editingStepId === step.id ? (
                                                  <div className="flex items-center gap-2 flex-1" onClick={e => e.stopPropagation()}>
                                                    <input
                                                      autoFocus
                                                      value={editingStepTitle}
                                                      onChange={e => setEditingStepTitle(e.target.value)}
                                                      className="flex-1 bg-background border border-primary px-2 py-1 rounded text-sm min-w-0"
                                                      onKeyDown={e => e.key === 'Enter' && handleSaveStep(challenge, step.id, e as any)}
                                                    />
                                                    <button onClick={(e) => handleSaveStep(challenge, step.id, e)} className="p-1 hover:bg-muted text-green-500 rounded"><Check className="w-4 h-4" /></button>
                                                    <button onClick={() => setEditingStepId(null)} className="p-1 hover:bg-muted text-red-500 rounded"><X className="w-4 h-4" /></button>
                                                  </div>
                                                ) : (
                                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <span className={`font-medium text-[13px] transition-all flex-shrink ${step.completed ? "text-muted-foreground line-through" : "text-foreground group-hover/step:translate-x-0.5"}`}>
                                                      {step.title}
                                                    </span>
                                                    
                                                    <div className="relative flex-shrink-0">
                                                      {editingStepDeadlineId === step.id ? (
                                                        <input
                                                          type="date"
                                                          autoFocus
                                                          value={stepTempDeadline || step.deadline || ""}
                                                          onChange={async (e) => {
                                                            setStepTempDeadline(e.target.value);
                                                            if (updateChallengeStep) {
                                                              await updateChallengeStep(challenge.id, step.id, { deadline: e.target.value });
                                                              setEditingStepDeadlineId(null);
                                                            }
                                                          }}
                                                          onBlur={() => setEditingStepDeadlineId(null)}
                                                          className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border bg-background border-primary text-primary outline-none focus:ring-2 focus:ring-primary/20 appearance-none h-5"
                                                        />
                                                      ) : (
                                                        <button 
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingStepDeadlineId(step.id);
                                                            setStepTempDeadline(step.deadline || "");
                                                          }}
                                                          className={cn(
                                                            "text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border flex items-center gap-1 transition-all active:scale-95",
                                                            step.deadline 
                                                              ? getDeadlineStatus(step.deadline)?.color 
                                                              : "text-muted-foreground/60 border-border/50 hover:border-primary/30 hover:text-primary"
                                                          )}
                                                        >
                                                          <Calendar className="w-2.5 h-2.5" />
                                                          {step.deadline ? formatDeadlineDate(step.deadline) : "Add Date"}
                                                        </button>
                                                      )}
                                                    </div>
                                                  </div>
                                                )}
                                              </div>

                                              {editingStepId !== step.id && (
                                                <div className="opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/step:opacity-100 transition-opacity flex gap-1 pl-4">
                                                  <button onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingStepId(step.id);
                                                    setEditingStepTitle(step.title);
                                                  }} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-primary"><Edit2 className="w-3 h-3" /></button>
                                                  <button onClick={(e) => handleDeleteStep(challenge.id, step.id, e)} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="py-8 text-center bg-muted/30 rounded-xl border border-dashed border-border mb-4 cursor-pointer hover:bg-muted/50 transition-all" onClick={() => expandChallengeDetails(challenge.id)}>
                                          <Sparkles className="w-6 h-6 text-primary mx-auto mb-2 opacity-50" />
                                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Construct Mastery Strategy</p>
                                        </div>
                                      )}

                                      <div className="mt-8 space-y-4">
                                        <div className="flex items-center justify-between">
                                          <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Knowledge Resources</h4>
                                          <button
                                            onClick={() => setAddingResourceTo(addingResourceTo === challenge.id ? null : challenge.id)}
                                            className="text-[10px] flex items-center gap-1 font-bold text-primary hover:text-primary/80 uppercase tracking-widest"
                                          >
                                            {addingResourceTo === challenge.id ? "Cancel" : "Add Link"}
                                          </button>
                                        </div>

                                        {addingResourceTo === challenge.id && (
                                          <form onSubmit={(e) => handleAddResource(challenge, e)} className="flex flex-col sm:flex-row gap-2 bg-background p-2 rounded-xl border border-primary/20">
                                            <input
                                              value={newResourceTitle} onChange={e => setNewResourceTitle(e.target.value)}
                                              placeholder="Title (optional)" className="flex-1 bg-transparent px-2 text-sm outline-none border-r border-border"
                                            />
                                            <input
                                              value={newResourceUrl} onChange={e => setNewResourceUrl(e.target.value)}
                                              placeholder="URL must exist..." required className="flex-[2] bg-transparent px-2 text-sm outline-none"
                                            />
                                            <button type="submit" className="bg-primary text-primary-foreground px-3 rounded-lg text-xs font-bold hover:opacity-90">Save</button>
                                          </form>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          {(challenge.resources || []).map((res: any, idx: number) => (
                                            <div key={idx} className="relative group/res">
                                              <a
                                                href={res.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-primary/50 hover:bg-muted/20 transition-all overflow-hidden"
                                              >
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover/res:bg-primary group-hover/res:text-primary-foreground transition-all">
                                                  <BookOpen className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0 pr-6">
                                                  <p className="text-xs font-bold truncate">{res.title}</p>
                                                  <p className="text-[9px] text-muted-foreground truncate group-hover/res:text-primary transition-colors">{res.url}</p>
                                                </div>
                                              </a>
                                              <button
                                                onClick={(e) => handleDeleteResource(challenge, res.url, e)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/res:opacity-100 hover:bg-red-500/10 text-red-500 rounded-lg transition-all"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </>
                                  </motion.div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })
      )}
    </div>
  );
}

export const InteractableSkillTracker = withInteractable(SkillTracker, {
  componentName: "SkillTracker",
  description: "Displays and manages user skill challenges and learning steps.",
  propsSchema: skillTrackerSchema,
});
