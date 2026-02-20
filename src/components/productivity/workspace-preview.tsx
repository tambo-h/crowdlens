"use client";

import React from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { CheckCircle2, Link as LinkIcon, BookOpen, Sparkles, Check } from "lucide-react";
import { withInteractable, useTamboThreadInput } from "@tambo-ai/react";
import { cn } from "@/lib/utils";

export const workspacePreviewSchema = z.object({
    role: z.string(),
    habits: z.array(z.object({
        name: z.string(),
        category: z.string().optional()
    })),
    links: z.array(z.object({
        title: z.string(),
        url: z.string()
    })),
    rules: z.array(z.string()).optional()
});

export type WorkspacePreviewProps = z.infer<typeof workspacePreviewSchema>;

export function WorkspacePreview({ role, habits = [], links = [], rules = [] }: WorkspacePreviewProps) {
    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-primary/5 p-4 border-b border-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Sparkles className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-foreground">{role} Setup</h3>
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Preview</p>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Challenges */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Skill Challenges</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-muted rounded-full">{habits.length}</span>
                    </div>
                    <div className="space-y-2">
                        {habits.slice(0, 5).map((habit, i) => (
                            <div key={i} className="flex items-center gap-3 text-xs bg-muted/30 p-2 rounded-lg border border-border/50">
                                <div className="w-4 h-4 rounded-full border border-primary/30 flex-shrink-0" />
                                <span className="text-foreground/80 font-medium truncate">{habit.name}</span>
                            </div>
                        ))}
                        {habits.length > 5 && (
                            <p className="text-[10px] text-center text-muted-foreground italic">+ {habits.length - 5} more challenges</p>
                        )}
                    </div>
                </div>

                {/* Resources */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Curated Resources</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-muted rounded-full">{links.length}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {links.slice(0, 3).map((link, i) => (
                            <div key={i} className="flex items-center gap-2 text-[11px] text-primary font-bold bg-primary/5 p-2 rounded-lg border border-primary/10 group cursor-default">
                                <LinkIcon className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{link.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rules */}
                {rules && rules.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Slow Productivity Rules</h4>
                        <div className="space-y-2">
                            {rules.map((rule, i) => (
                                <div key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground leading-relaxed">
                                    <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{rule}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-primary/10 p-4 text-center border-t border-primary/20">
                <p className="text-xs text-primary font-black uppercase tracking-widest mb-2">Ready to Start?</p>
                <ApplyButton />
            </div>
        </div>
    );
}

function ApplyButton() {
    const { setValue, submit } = useTamboThreadInput();

    return (
        <button
            onClick={async () => {
                setValue("apply");
                setTimeout(() => {
                    submit({ resourceNames: {} });
                }, 100);
            }}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
            Apply Setup Now
        </button>
    );
}

export const InteractableWorkspacePreview = withInteractable(WorkspacePreview, {
    componentName: "WorkspacePreview",
    description: "Visual preview of generated skills and resources for a workspace setup.",
    propsSchema: workspacePreviewSchema,
});
