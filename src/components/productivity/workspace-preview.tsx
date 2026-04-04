"use client";

import React from "react";
import { z } from "zod";
import { CheckCircle2, Link as LinkIcon, Sparkles, Check, Calendar, ArrowRight, Zap } from "lucide-react";
import { withInteractable } from "@tambo-ai/react";
import { cn } from "@/lib/utils";
import { useProductivity } from "@/context/productivity-context";

export const workspacePreviewSchema = z.object({
    role: z.string(),
    habits: z.array(z.object({
        name: z.string(),
        category: z.string().optional(),
        deadline: z.string().optional()
    })),
    links: z.array(z.object({
        title: z.string(),
        url: z.string()
    })),
    rules: z.array(z.string()).optional(),
    trackDeadline: z.string().optional()
});

export type WorkspacePreviewProps = z.infer<typeof workspacePreviewSchema>;

export function WorkspacePreview({ role, habits = [], links = [], rules = [], trackDeadline }: WorkspacePreviewProps) {
    const { setActiveView, setLastSetupRole } = useProductivity();

    const handleViewTrack = () => {
        setActiveView('skills');
        // Scroll to the newly added track after a short delay
        setTimeout(() => {
            const allTrackHeaders = document.querySelectorAll('[data-role-track]');
            const lastTrack = allTrackHeaders[allTrackHeaders.length - 1];
            if (lastTrack) {
                lastTrack.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                const mainEl = document.getElementById('main-scroll');
                if (mainEl) mainEl.scrollTo({ top: mainEl.scrollHeight, behavior: 'smooth' });
            }
        }, 400);
    };

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-black text-foreground text-sm leading-tight">{role}</h3>
                            <p className="text-[9px] uppercase font-black tracking-[0.2em] text-muted-foreground/60">Workspace Configured</p>
                        </div>
                    </div>
                    {/* Success badge */}
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Live</span>
                    </div>
                </div>

                {trackDeadline && (
                    <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 w-fit">
                        <Calendar className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-bold text-primary">
                            Target: {new Date(trackDeadline + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                )}
            </div>

            <div className="p-4 space-y-4">
                {/* Challenges */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Skill Challenges Added</h4>
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full border border-primary/20">{habits.length}</span>
                    </div>
                    <div className="space-y-1.5">
                        {habits.slice(0, 4).map((habit, i) => (
                            <div key={i} className="flex items-center gap-2.5 text-xs bg-muted/30 px-3 py-2 rounded-xl border border-border/50">
                                <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                <span className="text-foreground/80 font-medium truncate">{habit.name}</span>
                                {habit.deadline && (
                                    <span className="text-[8px] font-bold text-muted-foreground/60 ml-auto flex-shrink-0">{habit.deadline}</span>
                                )}
                            </div>
                        ))}
                        {habits.length > 4 && (
                            <p className="text-[10px] text-center text-muted-foreground/60 italic py-1">+ {habits.length - 4} more challenges waiting for you</p>
                        )}
                    </div>
                </div>

                {/* Resources */}
                {links.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Curated Resources</h4>
                        <div className="grid grid-cols-1 gap-1.5">
                            {links.slice(0, 3).map((link, i) => (
                                <div key={i} className="flex items-center gap-2 text-[11px] text-primary font-bold bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
                                    <LinkIcon className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{link.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* CTA */}
            <div className="p-4 border-t border-border/50 bg-muted/20">
                <button
                    onClick={handleViewTrack}
                    className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <Zap className="w-3.5 h-3.5" />
                    View My New Track
                    <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

export const InteractableWorkspacePreview = withInteractable(WorkspacePreview, {
    componentName: "WorkspacePreview",
    description: "Visual preview of generated skills and resources for a workspace setup.",
    propsSchema: workspacePreviewSchema,
});
