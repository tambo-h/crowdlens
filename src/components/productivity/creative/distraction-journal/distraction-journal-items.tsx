import React from "react";
import { useDistractionJournalContext, Distraction } from "./distraction-journal-context";

export interface DistractionJournalItemsProps {
    children: (props: { items: Distraction[] }) => React.ReactNode;
}

export const DistractionJournalItems = ({ children }: DistractionJournalItemsProps) => {
    const { distractions } = useDistractionJournalContext();

    const items = React.useMemo(() => distractions, [distractions]);

    return <>{children({ items })}</>;
};

DistractionJournalItems.displayName = "DistractionJournal.Items";
