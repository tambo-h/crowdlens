import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { StandupLogContext, StandupEntry } from "./standup-log-context";
import { saveStandupEntry as saveStandupService } from "@/services/productivity-service";

export interface StandupLogRootProps {
    children: React.ReactNode;
    asChild?: boolean;
    initialEntries?: StandupEntry[];
    className?: string;
}

export const StandupLogRoot = React.forwardRef<HTMLDivElement, StandupLogRootProps>(
    ({ children, asChild, initialEntries = [], ...props }, ref) => {
        const [entries, setEntries] = React.useState<StandupEntry[]>(initialEntries);
        const [isLoading, setIsLoading] = React.useState(false);

        // Sync with prop changes
        React.useEffect(() => {
            if (initialEntries) {
                setEntries(initialEntries);
            }
        }, [initialEntries]);

        const saveEntry = async (yesterday: string, today: string, blockers: string) => {
            setIsLoading(true);
            try {
                const result = await saveStandupService({ yesterday, today, blockers });
                const newEntry: StandupEntry = {
                    id: result.id,
                    yesterday,
                    today,
                    blockers,
                    date: result.date,
                };
                setEntries((prev) => [newEntry, ...prev]);
            } catch (error) {
                console.error("Failed to save standup:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const Comp = asChild ? Slot : "div";

        return (
            <StandupLogContext.Provider value={{ entries, isLoading, saveEntry }}>
                <Comp ref={ref} {...props}>
                    {children}
                </Comp>
            </StandupLogContext.Provider>
        );
    }
);

StandupLogRoot.displayName = "StandupLog.Root";
