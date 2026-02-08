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
import { CheckCircle2, Circle, ChevronDown, ChevronUp, ExternalLink, Plus, BookOpen, Sparkles } from "lucide-react";

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
  const { challenges, toggleChallenge, saveChallenge, isLoadingChallenges, userId, expandChallengeDetails, expandingIds } = useProductivity();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAddingInRole, setIsAddingInRole] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

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

          return (
            <div key={role} className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Progress Banner */}
              <div className="bg-primary/5 px-6 py-4 border-b border-border flex justify-between items-center group/track">
                <div className="space-y-1">
                  <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                    <span className="w-2 h-6 bg-primary rounded-full" />
                    {role} Track
                  </h2>
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

              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">Challenges</h3>
                  <button
                    onClick={() => setIsAddingInRole(isAddingInRole === role ? null : role)}
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
                      className={`group border rounded-xl transition-all duration-300 ${challenge.completed ? "bg-muted/10 border-border opacity-70" : "bg-background border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
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
                            <h3 className={`font-bold text-base transition-all ${challenge.completed ? "line-through text-muted-foreground" : "text-foreground group-hover:text-primary"}`}>
                              {challenge.title}
                            </h3>
                            {challenge.steps.length > 0 && (
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
                                <span className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">Architecting Strategy...</span>
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
                            className="overflow-hidden border-t border-border bg-muted/5 px-12 pb-5 pt-2"
                          >
                            {expandingIds.includes(challenge.id) ? (
                              <div className="py-8 text-center flex flex-col items-center">
                                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4" />
                                <p className="text-sm font-bold text-foreground">AI Analysis in progress...</p>
                              </div>
                            ) : (
                              <>
                                {challenge.steps.length > 0 ? (
                                  <div className="space-y-3 mt-2">
                                    {challenge.steps.map((step: any) => (
                                      <div
                                        key={step.id}
                                        className="flex items-center gap-3 text-sm group/step cursor-pointer py-1"
                                        onClick={() => toggleChallenge(challenge.id, undefined, step.id)}
                                      >
                                        <div className={`transition-all duration-300 ${step.completed ? "text-primary scale-110" : "text-muted-foreground group-hover/step:text-primary"}`}>
                                          {step.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                        </div>
                                        <span className={`font-medium transition-all ${step.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                                          {step.title}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="py-8 text-center bg-muted/30 rounded-xl border border-dashed border-border mb-4 cursor-pointer hover:bg-muted/50 transition-all" onClick={() => expandChallengeDetails(challenge.id)}>
                                    <Sparkles className="w-6 h-6 text-primary mx-auto mb-2 opacity-50" />
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Construct Mastery Strategy</p>
                                  </div>
                                )}

                                {challenge.resources && challenge.resources.length > 0 && (
                                  <div className="mt-8 space-y-4">
                                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Knowledge Resources</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {challenge.resources.map((res: any, idx: number) => (
                                        <a
                                          key={idx}
                                          href={res.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-primary/50 hover:bg-muted/20 transition-all group/res overflow-hidden"
                                        >
                                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover/res:bg-primary group-hover/res:text-primary-foreground transition-all">
                                            <BookOpen className="w-4 h-4" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold truncate">{res.title}</p>
                                            <p className="text-[9px] text-muted-foreground truncate group-hover/res:text-primary transition-colors">{res.url}</p>
                                          </div>
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
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
