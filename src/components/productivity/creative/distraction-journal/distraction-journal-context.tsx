import React from "react";

export interface Distraction {
    id: string;
    description: string;
    durationMinutes: number;
    category?: string;
    timestamp: string;
}

export interface DistractionJournalContextValue {
    distractions: Distraction[];
    isLoading: boolean;
    addDistraction: (description: string, durationMinutes: number, category?: string) => Promise<void>;
}

const DistractionJournalContext = React.createContext<DistractionJournalContextValue | null>(null);

export function useDistractionJournalContext() {
    const context = React.useContext(DistractionJournalContext);
    if (!context) {
        throw new Error("DistractionJournal parts must be used within DistractionJournal.Root");
    }
    return context;
}

export { DistractionJournalContext };
