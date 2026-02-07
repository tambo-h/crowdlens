import React from "react";

export interface StandupEntry {
    id: string;
    yesterday: string;
    today: string;
    blockers: string;
    date: string;
}

export interface StandupLogContextValue {
    entries: StandupEntry[];
    isLoading: boolean;
    saveEntry: (yesterday: string, today: string, blockers: string) => Promise<void>;
}

const StandupLogContext = React.createContext<StandupLogContextValue | null>(null);

export function useStandupLogContext() {
    const context = React.useContext(StandupLogContext);
    if (!context) {
        throw new Error("StandupLog parts must be used within StandupLog.Root");
    }
    return context;
}

export { StandupLogContext };
