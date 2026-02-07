import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { WeeklyReviewContext, WeeklyReview } from "./weekly-review-context";

// We'll add saveWeeklyReview to productivity-service.ts next
import { saveWeeklyReview, getWeeklyReviews } from "@/services/productivity-service";
import { useProductivity } from "@/context/productivity-context";

export interface WeeklyReviewRootProps {
    children: React.ReactNode;
    asChild?: boolean;
    initialReviews?: WeeklyReview[];
    className?: string;
}

export const WeeklyReviewRoot = React.forwardRef<HTMLDivElement, WeeklyReviewRootProps>(
    ({ children, asChild, initialReviews = [], ...props }, ref) => {
        const { creativeRefreshTrigger } = useProductivity();
        const [reviews, setReviews] = React.useState<WeeklyReview[]>(initialReviews);
        const [isLoading, setIsLoading] = React.useState(false);

        // Initial fetch
        React.useEffect(() => {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    const history = await getWeeklyReviews({});
                    setReviews(history);
                } catch (error) {
                    console.error("Failed to fetch weekly reviews:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }, [creativeRefreshTrigger]);

        const saveReview = async (accomplishments: string, challenges: string, nextWeekGoals: string, rating: number) => {
            setIsLoading(true);
            try {
                const result = await saveWeeklyReview({ accomplishments, challenges, nextWeekGoals, rating });
                const newReview: WeeklyReview = {
                    id: result.id,
                    weekEnding: result.date,
                    accomplishments,
                    challenges,
                    nextWeekGoals,
                    rating,
                    timestamp: result.date,
                };
                setReviews((prev) => [newReview, ...prev]);
            } catch (error) {
                console.error("Failed to save weekly review:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const Comp = asChild ? Slot : "div";

        return (
            <WeeklyReviewContext.Provider value={{ reviews, isLoading, saveReview }}>
                <Comp ref={ref} {...props}>
                    {children}
                </Comp>
            </WeeklyReviewContext.Provider>
        );
    }
);

WeeklyReviewRoot.displayName = "WeeklyReview.Root";
