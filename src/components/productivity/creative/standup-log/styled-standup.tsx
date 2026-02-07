"use client";

import React from "react";
import { StandupLog, StandupEntry } from "./index";
import { z } from "zod";
import { Calendar, CheckCircle2, Circle, AlertCircle, Send, History } from "lucide-react";
import { format } from "date-fns";
import { useStandupLogContext } from "./standup-log-context";

export const standupLogSchema = z.object({
    initialEntries: z.array(z.any()).optional(),
});

type StandupLogProps = z.infer<typeof standupLogSchema>;

const LogInner = () => {
    const { entries, saveEntry, isLoading } = useStandupLogContext();
    const [yesterday, setYesterday] = React.useState("");
    const [today, setToday] = React.useState("");
    const [blockers, setBlockers] = React.useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!yesterday || !today) return;
        saveEntry(yesterday, today, blockers);
        setYesterday("");
        setToday("");
        setBlockers("");
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3 px-1">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-foreground">Daily Stand-up</h2>
                    <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM do")}</p>
                </div>
            </div>

            {/* Entry Form */}
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <History className="w-4 h-4 text-muted-foreground" />
                            What did you do yesterday?
                        </label>
                        <textarea
                            placeholder="e.g., Finished the authentication flow, fixed bug #123..."
                            value={yesterday}
                            onChange={(e) => setYesterday(e.target.value)}
                            className="w-full h-24 p-3 rounded-md bg-background border border-input focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            What are you doing today?
                        </label>
                        <textarea
                            placeholder="e.g., Implementing the creative tools UI, team sync at 2 PM..."
                            value={today}
                            onChange={(e) => setToday(e.target.value)}
                            className="w-full h-24 p-3 rounded-md bg-background border border-input focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-accent" />
                            Any blockers?
                        </label>
                        <input
                            placeholder="e.g., Waiting for API documentation, design review..."
                            value={blockers}
                            onChange={(e) => setBlockers(e.target.value)}
                            className="w-full h-10 px-3 rounded-md bg-background border border-input focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !yesterday || !today}
                        className="w-full h-11 px-4 rounded-md bg-primary text-primary-foreground font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                        {isLoading ? "Saving..." : "Log Stand-up Status"}
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>

            {/* History */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground px-1">Past Entries</h3>
                <StandupLog.Items>
                    {({ items }) => (
                        <div className="space-y-4">
                            {items.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                                    No previous entries found.
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div key={item.id} className="bg-card rounded-xl p-5 border border-border shadow-sm hover:border-primary/20 transition-all">
                                        <div className="text-xs font-medium text-muted-foreground mb-3">
                                            {format(new Date(item.date), "MMM d, yyyy")}
                                        </div>
                                        <div className="grid gap-4">
                                            <div className="space-y-1">
                                                <div className="text-xs uppercase font-bold text-muted-foreground tracking-tighter">Yesterday</div>
                                                <p className="text-sm text-foreground">{item.yesterday}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-xs uppercase font-bold text-primary tracking-tighter">Today</div>
                                                <p className="text-sm text-foreground font-medium">{item.today}</p>
                                            </div>
                                            {item.blockers && (
                                                <div className="space-y-1 border-t border-border pt-3">
                                                    <div className="text-xs uppercase font-bold text-accent tracking-tighter">Blockers</div>
                                                    <p className="text-sm text-foreground italic">{item.blockers}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </StandupLog.Items>
            </div>
        </div>
    );
};

export const StyledStandupLog = ({ initialEntries }: StandupLogProps) => {
    return (
        <StandupLog.Root initialEntries={initialEntries} className="max-w-xl mx-auto p-4">
            <LogInner />
        </StandupLog.Root>
    );
};
