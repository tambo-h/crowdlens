import React from "react";

export interface WeeklyReview {
    id: string;
    weekEnding: string;
    accomplishments: string;
    challenges: string;
    nextWeekGoals: string;
    rating: number; // 1-5
    timestamp: string;
}

export interface WeeklyReviewContextValue {
    reviews: WeeklyReview[];
    isLoading: boolean;
    saveReview: (accomplishments: string, challenges: string, nextWeekGoals: string, rating: number) => Promise<void>;
}

const WeeklyReviewContext = React.createContext<WeeklyReviewContextValue | null>(null);

export function useWeeklyReviewContext() {
    const context = React.useContext(WeeklyReviewContext);
    if (!context) {
        throw new Error("WeeklyReview parts must be used within WeeklyReview.Root");
    }
    return context;
}

export { WeeklyReviewContext };
