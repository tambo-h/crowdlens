"use client";

import React from "react";
import { WeeklyReview, WeeklyReview as WeeklyReviewType } from "./index";
import { z } from "zod";
import { ListChecks, Target, AlertCircle, Star, Save, Sparkles, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useWeeklyReviewContext } from "./weekly-review-context";

export const weeklyReviewSchema = z.object({
    initialReviews: z.array(z.any()).optional(),
});

type WeeklyReviewProps = z.infer<typeof weeklyReviewSchema>;

const ReviewInner = () => {
    const { reviews, saveReview, isLoading } = useWeeklyReviewContext();
    const [accomplishments, setAccomplishments] = React.useState("");
    const [challenges, setChallenges] = React.useState("");
    const [nextWeekGoals, setNextWeekGoals] = React.useState("");
    const [rating, setRating] = React.useState(5);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!accomplishments || !nextWeekGoals) return;
        saveReview(accomplishments, challenges, nextWeekGoals, rating);
        setAccomplishments("");
        setChallenges("");
        setNextWeekGoals("");
        setRating(5);
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex items-center gap-3 px-1">
                <div className="p-3 bg-primary/10 rounded-2xl">
                    <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-foreground tracking-tight">Weekly Review</h2>
                    <p className="text-sm text-muted-foreground font-medium">Reflect. Reset. Refocus.</p>
                </div>
            </div>

            {/* Review Form */}
            <div className="bg-card rounded-3xl p-8 shadow-xl border border-border/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <ListChecks className="w-24 h-24" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                <ListChecks className="w-4 h-4 text-primary" />
                                Key Accomplishments
                            </label>
                            <textarea
                                placeholder="What did you achieve this week?"
                                value={accomplishments}
                                onChange={(e) => setAccomplishments(e.target.value)}
                                className="w-full h-32 p-4 rounded-2xl bg-background/50 border border-input focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none text-sm"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-destructive" />
                                Challenges & Bottlenecks
                            </label>
                            <textarea
                                placeholder="What slowed you down?"
                                value={challenges}
                                onChange={(e) => setChallenges(e.target.value)}
                                className="w-full h-32 p-4 rounded-2xl bg-background/50 border border-input focus:ring-4 focus:ring-destructive/10 focus:border-destructive outline-none transition-all resize-none text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" />
                            Primary Goals for Next Week
                        </label>
                        <textarea
                            placeholder="What are the 'Big Rocks' for next week?"
                            value={nextWeekGoals}
                            onChange={(e) => setNextWeekGoals(e.target.value)}
                            className="w-full h-24 p-4 rounded-2xl bg-background/50 border border-input focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none text-sm"
                        />
                    </div>

                    <div className="flex items-center justify-between border-t border-border/50 pt-6">
                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Satisfaction</label>
                            <div className="flex gap-1.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setRating(s)}
                                        className={`p-1.5 rounded-lg transition-all ${rating >= s ? "text-yellow-500 scale-110" : "text-muted/30 hover:text-muted/60"
                                            }`}
                                    >
                                        <Star className="w-6 h-6" fill={rating >= s ? "currentColor" : "none"} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !accomplishments || !nextWeekGoals}
                            className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-black hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                        >
                            {isLoading ? "Saving..." : "Finish Weekly Review"}
                            <Save className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>

            {/* Past Reviews */}
            <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground px-4">Insights Archive</h3>
                <WeeklyReview.Items>
                    {({ items }) => (
                        <div className="space-y-4">
                            {items.length === 0 ? (
                                <div className="text-center py-16 text-muted-foreground bg-muted/10 rounded-3xl border-4 border-dotted border-muted/50">
                                    Your growth journey starts here.
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div key={item.id} className="bg-card rounded-3xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-all group">
                                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50">
                                            <div className="font-bold text-foreground">Week Ending {format(new Date(item.timestamp), "MMM d, yyyy")}</div>
                                            <div className="flex gap-0.5">
                                                {[...Array(item.rating)].map((_, i) => (
                                                    <Star key={i} className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-3 gap-6">
                                            <div className="space-y-1.5">
                                                <div className="text-[10px] uppercase font-black text-primary tracking-widest">Accomplishments</div>
                                                <p className="text-sm text-foreground/80 line-clamp-3">{item.accomplishments}</p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="text-[10px] uppercase font-black text-destructive tracking-widest">Challenges</div>
                                                <p className="text-sm text-foreground/80 line-clamp-3">{item.challenges || "None"}</p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="text-[10px] uppercase font-black text-muted-foreground tracking-widest italic">Next Week</div>
                                                <p className="text-sm text-foreground/80 font-medium line-clamp-3">{item.nextWeekGoals}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </WeeklyReview.Items>
            </div>
        </div>
    );
};

export const StyledWeeklyReview = ({ initialReviews }: WeeklyReviewProps) => {
    return (
        <WeeklyReview.Root initialReviews={initialReviews} className="max-w-4xl mx-auto p-4">
            <ReviewInner />
        </WeeklyReview.Root>
    );
};
