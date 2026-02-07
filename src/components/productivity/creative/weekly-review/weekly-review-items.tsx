import React from "react";
import { useWeeklyReviewContext, WeeklyReview } from "./weekly-review-context";

export interface WeeklyReviewItemsProps {
    children: (props: { items: WeeklyReview[] }) => React.ReactNode;
}

export const WeeklyReviewItems = ({ children }: WeeklyReviewItemsProps) => {
    const { reviews } = useWeeklyReviewContext();

    const items = React.useMemo(() => reviews, [reviews]);

    return <>{children({ items })}</>;
};

WeeklyReviewItems.displayName = "WeeklyReview.Items";
