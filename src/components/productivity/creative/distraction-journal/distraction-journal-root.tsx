import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { DistractionJournalContext, Distraction } from "./distraction-journal-context";
import { logDistraction } from "@/services/productivity-service";

export interface DistractionJournalRootProps {
    children: React.ReactNode;
    asChild?: boolean;
    initialDistractions?: Distraction[];
    className?: string;
}

export const DistractionJournalRoot = React.forwardRef<HTMLDivElement, DistractionJournalRootProps>(
    ({ children, asChild, initialDistractions = [], ...props }, ref) => {
        const [distractions, setDistractions] = React.useState<Distraction[]>(initialDistractions);
        const [isLoading, setIsLoading] = React.useState(false);

        // Sync with prop changes
        React.useEffect(() => {
            if (initialDistractions) {
                setDistractions(initialDistractions);
            }
        }, [initialDistractions]);

        const addDistraction = async (description: string, durationMinutes: number, category?: string) => {
            setIsLoading(true);
            try {
                const result = await logDistraction({ description, durationMinutes, category });
                const newDistraction: Distraction = {
                    id: result.id,
                    description,
                    durationMinutes,
                    category,
                    timestamp: result.timestamp,
                };
                setDistractions((prev) => [newDistraction, ...prev]);
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
