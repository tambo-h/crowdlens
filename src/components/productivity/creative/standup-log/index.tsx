import { StandupLogRoot } from "./standup-log-root";
import { StandupLogItems } from "./standup-log-items";

export const StandupLog = {
    Root: StandupLogRoot,
    Items: StandupLogItems,
};

export type { StandupLogRootProps } from "./standup-log-root";
export type { StandupEntry } from "./standup-log-context";
export type { StandupLogItemsProps } from "./standup-log-items";
