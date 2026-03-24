/**
 * @file skill-tracker.tsx
 * @description Tambo generative and interactable component for skill and challenge tracking
 */

"use client";

import { z } from "zod";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { withInteractable } from "@tambo-ai/react";
import { useProductivity } from "@/context/productivity-context";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, ExternalLink, Plus, BookOpen, Sparkles, Trash2, Edit2, X, Check, AlertOctagon } from "lucide-react";

export const skillTrackerSchema = z.object({
  challenges: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      completed: z.boolean(),
      role: z.string(),
      steps: z.array(z.object({ id: z.string(), title: z.string(), completed: z.boolean() })),
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
    expandingIds,
    addChallengeStep,
    updateChallengeStep,
    deleteChallengeStep,
    deleteRoleTrack
  } = useProductivity();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAddingInRole, setIsAddingInRole] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [collapsedRoles, setCollapsedRoles] = useState<string[]>([]);

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

  // Initialize collapsed states once when challenges load
  useState(() => {
    const roles = Array.from(new Set(challenges.map(c => c.role || "General")));
    if (roles.length > 1) {
      // Keep only the first one expanded
      setCollapsedRoles(roles.slice(1));
    }
  });

  const toggleCollapse = (role: string) => {
    setCollapsedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleExpand = (challenge: any) => {
    const isExpanding = expandedId !== challenge.id;
    setExpandedId(isExpanding ? challenge.id : null);

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

  const sortedRoles = Object.keys(groups).sort();

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
    if (confirm("Delete this main task?")) {
      if (deleteChallenge) await deleteChallenge(id);
    }
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
      await updateChallengeStep(challenge.id, stepId, editingStepTitle.trim());
    }
    setEditingStepId(null);
  };

  const handleAddStep = async (challengeId: string) => {
    if (!newStepTitle.trim() || !addChallengeStep) return;
    await addChallengeStep(challengeId, newStepTitle.trim());
    setNewStepTitle("");
    setAddingStepTo(null);
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
    if (confirm("Delete this resource?") && updateChallenge) {
      const resources = challenge.resources.filter((r: any) => r.url !== url);
      await updateChallenge(challenge.id, { resources });
    }
  };

  return (
    <div className="max-w-4xl w-full space-y-8 pb-12">
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
            <div key={role} className="glass-panel rounded-2xl border border-border/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xl">
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
                      <div className="ml-2 text-muted-foreground group-hover/track:text-primary transition-colors">
                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </div>
                    </h2>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete entire ${role} track? This cannot be undone.`)) {
                        deleteRoleTrack && deleteRoleTrack(role);
                      }
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
                            className={`group border rounded-xl transition-all duration-300 relative ${challenge.completed ? "bg-muted/10 border-border opacity-70" : "bg-background/80 border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 backdrop-blur-sm"
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
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="flex -space-x-1">
                                        {challenge.steps.slice(0, 3).map((_step: any, i: number) => (
                                          <div key={i} className={`w-1.5 h-1.5 rounded-full border border-background ${challenge.steps[i].completed ? "bg-primary" : "bg-muted-foreground/30"}`} />
                                        ))}
                                      </div>
                                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        {challenge.steps.filter((s: any) => s.completed).length}/{challenge.steps.length} Steps
                                      </span>
                                    </div>
                                  )}
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
                                  className="overflow-hidden border-t border-border bg-muted/5 px-12 pb-5 pt-2 relative"
                                >
                                  {expandingIds.includes(challenge.id) ? (
                                    <div className="py-8 text-center flex flex-col items-center">
                                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4" />
                                      <p className="text-sm font-bold text-foreground">AI Strategy Loading...</p>
                                    </div>
                                  ) : (
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
                                                  <span className={`font-medium text-[13px] transition-all ${step.completed ? "text-muted-foreground line-through" : "text-foreground group-hover/step:translate-x-0.5"}`}>
                                                    {step.title}
                                                  </span>
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
                                          <form onSubmit={(e) => handleAddResource(challenge, e)} className="flex gap-2 bg-background p-2 rounded-xl border border-primary/20">
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
