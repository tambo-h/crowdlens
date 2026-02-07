"use client";

import React from "react";
import { DistractionJournal, Distraction } from "./index";
import { z } from "zod";
import { Clock, AlertTriangle, List, Plus } from "lucide-react";
import { format } from "date-fns";
import { useDistractionJournalContext } from "./distraction-journal-context";

export const distractionJournalSchema = z.object({
    initialDistractions: z.array(z.any()).optional(),
    showAnalytics: z.boolean().optional().default(false),
});

type DistractionJournalProps = z.infer<typeof distractionJournalSchema>;

const JournalInner = () => {
    const { distractions, addDistraction, isLoading } = useDistractionJournalContext();
    const [description, setDescription] = React.useState("");
    const [duration, setDuration] = React.useState("15");
    const [category, setCategory] = React.useState("Internal");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description) return;
        addDistraction(description, parseInt(duration), category);
        setDescription("");
    };

    return (
        <div className="space-y-6">
            {/* Log Form */}
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-accent" />
                    <h2 className="text-lg font-bold text-foreground">Log Interruption</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="description" className="text-sm font-medium text-muted-foreground">What distracted you?</label>
                        <input
                            id="description"
                            placeholder="e.g., Slack notification, phone call..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full h-10 px-3 rounded-md bg-background border border-input focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label htmlFor="duration" className="text-sm font-medium text-muted-foreground">Duration (mins)</label>
                            <input
                                id="duration"
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-full h-10 px-3 rounded-md bg-background border border-input focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="category" className="text-sm font-medium text-muted-foreground">Category</label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full h-10 px-3 rounded-md bg-background border border-input focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            >
                                <option value="Internal">Internal (Self)</option>
                                <option value="External">External (Others)</option>
                                <option value="Tech">Technical Issue</option>
                                <option value="Environment">Environment</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !description}
                        className="w-full h-10 px-4 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? "Logging..." : "Log Distraction"}
                        <Plus className="w-4 h-4" />
                    </button>
                </form>
            </div>

            {/* History List */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground px-1">
                    <List className="w-4 h-4" />
                    <h3 className="text-sm font-medium uppercase tracking-wider">Recent Distractions</h3>
                </div>

                <DistractionJournal.Items>
                    {({ items }) => (
                        <div className="space-y-3">
                            {items.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-xl border-2 border-dashed border-muted/50">
                                    No distractions logged yet. Stay focused!
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div key={item.id} className="bg-card rounded-lg p-4 border border-border shadow-sm hover:border-primary/30 transition-all group">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{item.description}</div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-3">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3 text-accent" />
                                                        {item.durationMinutes}m
                                                    </span>
                                                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                                                        {item.category}
                                                    </span>
                                                    <span>{format(new Date(item.timestamp), "h:mm a")}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </DistractionJournal.Items>
            </div>
        </div>
    );
};

export const StyledDistractionJournal = ({ initialDistractions, showAnalytics }: DistractionJournalProps) => {
    return (
        <DistractionJournal.Root initialDistractions={initialDistractions} className="max-w-md mx-auto p-4">
            <JournalInner />
        </DistractionJournal.Root>
    );
};
