import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { DistractionJournalContext, Distraction } from "./distraction-journal-context";
import { logDistraction, getDistractions } from "@/services/productivity-service";
import { useProductivity } from "@/context/productivity-context";

export interface DistractionJournalRootProps {
    children: React.ReactNode;
    asChild?: boolean;
    initialDistractions?: Distraction[];
    className?: string;
}

export const DistractionJournalRoot = React.forwardRef<HTMLDivElement, DistractionJournalRootProps>(
    ({ children, asChild, initialDistractions = [], ...props }, ref) => {
        const { creativeRefreshTrigger, triggerCreativeRefresh, userId } = useProductivity();
        const [distractions, setDistractions] = React.useState<Distraction[]>(initialDistractions);
        const [isLoading, setIsLoading] = React.useState(false);

        // Initial fetch
        React.useEffect(() => {
            const fetchData = async () => {
                if (!userId) return;
                setIsLoading(true);
                try {
                    const data = await getDistractions(userId);
                    setDistractions(data);
                } catch (error) {
                    console.error("Failed to fetch distractions:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }, [creativeRefreshTrigger, userId]);

        const addDistraction = async (description: string, durationMinutes: number, category?: string) => {
            if (!userId) return;
            setIsLoading(true);
            try {
                const result = await logDistraction(userId, { description, durationMinutes, category });
                const newDistraction: Distraction = {
                    id: result.id,
                    description,
                    durationMinutes,
                    category,
                    timestamp: result.timestamp,
                };
                setDistractions((prev) => [newDistraction, ...prev]);
                triggerCreativeRefresh();
            } catch (error) {
                console.error("Failed to log distraction:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const Comp = asChild ? Slot : "div";

        return (
            <DistractionJournalContext.Provider value={{ distractions, isLoading, addDistraction }}>
                <Comp ref={ref} {...props}>
                    {children}
                </Comp>
            </DistractionJournalContext.Provider>
        );
    }
);

DistractionJournalRoot.displayName = "DistractionJournal.Root";
