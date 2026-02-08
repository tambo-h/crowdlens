/**
 * @file skill-tracker.tsx
 * @description Tambo generative and interactable component for skill and challenge tracking
 */

"use client";

import { z } from "zod";
import { useState } from "react";
import { withInteractable } from "@tambo-ai/react";
import { useProductivity } from "@/context/productivity-context";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, ExternalLink, Plus, BookOpen } from "lucide-react";

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
  const { challenges, toggleChallenge, isLoadingChallenges, userId, expandChallengeDetails, expandingIds } = useProductivity();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleExpand = (challenge: any) => {
    const isExpanding = expandedId !== challenge.id;
    setExpandedId(isExpanding ? challenge.id : null);

    if (isExpanding && challenge.steps.length === 0 && challenge.resources.length === 0) {
      expandChallengeDetails(challenge.id);
    }
  };
  const [newTitle, setNewTitle] = useState("");

  if (isLoadingChallenges) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-lg border border-border max-w-2xl w-full text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">Loading your skills...</p>
      </div>
    );
  }

  const role = challenges.length > 0 ? challenges[0].role : "General";
  const completedCount = challenges.filter(c => c.completed).length;

  const handleAdd = async () => {
    if (!newTitle.trim() || !userId) return;
    // We would call saveChallenge here, but for now we'll rely on the context being updated
    // or call the service directly if we had a wrapped method.
    // Let's assume the context will need a 'saveChallenge' method.
    setIsAdding(false);
    setNewTitle("");
  };

  return (
    <div className="bg-card rounded-xl shadow-xl border border-border max-w-2xl w-full overflow-hidden">
      {/* Top Banner Counter (Req 13) */}
      <div className="bg-primary/10 px-6 py-3 border-b border-primary/20 flex justify-between items-center">
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">Progress</span>
        <div className="flex items-center gap-2">
          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${(completedCount / (challenges.length || 1)) * 100}%` }}
            />
          </div>
          <span className="text-sm font-bold text-foreground">{completedCount}/{challenges.length} Done</span>
        </div>
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">{role} Skill Tracker</h2>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="p-2 rounded-full bg-primary text-primary-foreground hover:scale-110 transition-transform"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Manual Add Form (Req 4) */}
        {isAdding && (
          <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-dashed border-primary/50 animate-in fade-in slide-in-from-top-2">
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Master React Server Components"
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => setIsAdding(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={handleAdd} className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded">Add Skill</button>
            </div>
          </div>
        )}

        {challenges.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl block mb-4">💡</span>
            <p className="text-muted-foreground">No skills tracked yet. Start by defining your role in the chat!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className={`group border rounded-xl transition-all ${challenge.completed ? "bg-muted/10 border-border" : "bg-card border-border hover:border-primary/50"
                  }`}
              >
                {/* Main Row */}
                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => toggleChallenge(challenge.id, !challenge.completed)}
                      className={`flex-shrink-0 transition-colors ${challenge.completed ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                    >
                      {challenge.completed ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
                    </button>

                    <div className="flex-1 cursor-pointer" onClick={() => handleExpand(challenge)}>
                      <h3 className={`font-semibold text-lg ${challenge.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {challenge.title}
                      </h3>
                      {challenge.steps.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {challenge.steps.filter(s => s.completed).length}/{challenge.steps.length} steps completed
                        </p>
                      )}
                      {expandingIds.includes(challenge.id) && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="animate-spin w-3 h-3 border-2 border-primary border-t-transparent rounded-full" />
                          <span className="text-[10px] text-primary font-bold uppercase tracking-tighter">AI Architecting...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleExpand(challenge)}
                    className="p-1 hover:bg-muted rounded text-muted-foreground"
                  >
                    {expandedId === challenge.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {/* Expanded Details (Steps & Resources) */}
                {expandedId === challenge.id && (
                  <div className="px-12 pb-5 pt-1 border-t border-border bg-muted/20 animate-in fade-in zoom-in-95 duration-200">
                    {expandingIds.includes(challenge.id) ? (
                      <div className="py-8 flex flex-col items-center justify-center text-center">
                        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mb-3" />
                        <p className="text-sm font-medium text-foreground">Generating Challenge Strategy...</p>
                        <p className="text-xs text-muted-foreground italic">Breaking down complex mastery into steps & resources</p>
                      </div>
                    ) : (
                      <>
                        {/* Steps */}
                        {challenge.steps.length > 0 ? (
                          <div className="mt-4">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Checklist</h4>
                            <div className="space-y-2">
                              {challenge.steps.map((step) => (
                                <div
                                  key={step.id}
                                  className="flex items-center gap-2 text-sm group/step cursor-pointer"
                                  onClick={() => toggleChallenge(challenge.id, undefined, step.id)}
                                >
                                  {step.completed ?
                                    <CheckCircle2 className="w-4 h-4 text-primary" /> :
                                    <Circle className="w-4 h-4 text-muted-foreground group-hover/step:text-primary" />
                                  }
                                  <span className={step.completed ? "text-muted-foreground line-through" : "text-foreground"}>
                                    {step.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="py-6 text-center text-muted-foreground text-sm">
                            Click to generate strategy using AI
                          </div>
                        )}

                        {/* Resources (Req 5) */}
                        {challenge.resources.length > 0 && (
                          <div className="mt-6">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Resources</h4>
                            <div className="grid grid-cols-1 gap-2">
                              {challenge.resources.map((res, idx) => (
                                <a
                                  key={idx}
                                  href={res.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-2 bg-background border border-border rounded-lg text-sm hover:border-primary/50 transition-colors group/link"
                                >
                                  <BookOpen className="w-4 h-4 text-primary" />
                                  <span className="flex-1 font-medium truncate">{res.title}</span>
                                  <ExternalLink className="w-3 h-3 text-muted-foreground group-hover/link:text-primary" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const InteractableSkillTracker = withInteractable(SkillTracker, {
  componentName: "SkillTracker",
  description: "Displays and manages user skill challenges and learning steps.",
  propsSchema: skillTrackerSchema,
});
