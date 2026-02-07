import React from "react";
import { useStandupLogContext, StandupEntry } from "./standup-log-context";

export interface StandupLogItemsProps {
    children: (props: { items: StandupEntry[] }) => React.ReactNode;
}

export const StandupLogItems = ({ children }: StandupLogItemsProps) => {
    const { entries } = useStandupLogContext();

    const items = React.useMemo(() => entries, [entries]);

    return <>{children({ items })}</>;
};

StandupLogItems.displayName = "StandupLog.Items";
