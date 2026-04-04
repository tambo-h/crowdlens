import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

import { Challenge, getChallenges, toggleChallenge as toggleChallengeService, saveChallenge as saveChallengeService, startPomodoroSession as startPomodoroService, seedProductivityData, getEnergyData, logEnergyLevel as logEnergyService, expandChallenge as expandChallengeService, checkUserExistence } from "@/services/productivity-service";

interface PomodoroState {
    isRunning: boolean;
    timeLeft: number;
    sessionType: "work" | "break" | "longBreak";
    sessionsCompleted: number;
    sessionsToday: number;
    workDuration: number;
    breakDuration: number;
    longBreakDuration: number;
    projectName?: string;
}

interface ProductivityContextType {
    // Auth/User
    userId: string | null;
    setUserId: React.Dispatch<React.SetStateAction<string | null>>;
    onboardGuest: () => Promise<void>;

    // Challenges / Skills
    challenges: Challenge[];
    isLoadingChallenges: boolean;
    expandingIds: string[];
    refreshChallenges: (background?: boolean) => Promise<void>;
    saveChallenge: (challenge: Omit<Challenge, "id">) => Promise<void>;
    toggleChallenge: (challengeId: string, completed?: boolean, stepId?: string) => Promise<void>;
    updateChallenge?: (id: string, updates: any) => Promise<void>;
    deleteChallenge?: (id: string) => Promise<void>;
    deleteRoleTrack?: (role: string) => Promise<void>;
    expandChallengeDetails: (challengeId: string) => Promise<void>;
    abortExpansion: (challengeId: string) => void;
    addChallengeStep: (challengeId: string, title: string) => Promise<void>;
    updateChallengeStep: (challengeId: string, stepId: string, title: string) => Promise<void>;
    deleteChallengeStep: (challengeId: string, stepId: string) => Promise<void>;

    // Pomodoro
    pomodoro: PomodoroState;
    startPomodoro: (props: Partial<PomodoroState>) => void;
    pausePomodoro: () => void;
    resetPomodoro: () => void;
    tickPomodoro: () => void;
    tickPomodoroRef?: React.MutableRefObject<() => void>;
    updatePomodoroDurations: (work: number, breakD: number, long: number) => void;

    // View Management
    activeView: string;
    setActiveView: (view: string) => void;
    isChatOpen: boolean;
    setIsChatOpen: (open: boolean) => void;
    expandedId: string | null;
    setExpandedId: (id: string | null) => void;
    collapsedRoles: string[];
    setCollapsedRoles: (roles: string[] | ((prev: string[]) => string[])) => void;

    // Creative Tools Sync
    creativeRefreshTrigger: number;
    triggerCreativeRefresh: () => void;

    // Energy Awareness
    currentEnergy: number | null;
    refreshCurrentEnergy: () => Promise<void>;
    logEnergyLevel: (input: { level: number, notes?: string }) => Promise<void>;

    // Track Deadlines
    trackDeadlines: Record<string, string>;
    setTrackDeadline: (role: string, deadline: string) => Promise<void>;

    // Global Confirmation
    confirmState: {
        isOpen: boolean;
        title: string;
        message: string | React.ReactNode;
        onConfirm: () => void | Promise<void>;
        confirmText?: string;
        type?: "danger" | "info";
    };
    openConfirm: (config: { title: string, message: string | React.ReactNode, onConfirm: () => void | Promise<void>, confirmText?: string, type?: "danger" | "info" }) => void;
    closeConfirm: () => void;
}

const ProductivityContext = createContext<ProductivityContextType | undefined>(undefined);

export function ProductivityProvider({ children }: { children: React.ReactNode }) {
    const [userId, setUserId] = useState<string | null>(null);
    const [activeView, setActiveView] = useState("dashboard");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [collapsedRoles, setCollapsedRoles] = useState<string[]>([]);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [creativeRefreshTrigger, setCreativeRefreshTrigger] = useState(0);

    // Energy state
    const [currentEnergy, setCurrentEnergy] = useState<number | null>(null);

    // Challenges state
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [isLoadingChallenges, setIsLoadingChallenges] = useState(false);
    const [expandingIds, setExpandingIds] = useState<string[]>([]);
    const cancelledExpansions = React.useRef<Set<string>>(new Set());
    const [trackDeadlines, setTrackDeadlines] = useState<Record<string, string>>({});

    // Pomodoro state
    const [pomodoro, setPomodoro] = useState<PomodoroState>({
        isRunning: false,
        timeLeft: 25 * 60,
        sessionType: "work",
        sessionsCompleted: 0,
        sessionsToday: 0,
        workDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
    });

    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        title: string;
        message: string | React.ReactNode;
        onConfirm: () => void | Promise<void>;
        confirmText?: string;
        type?: "danger" | "info";
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => {},
        confirmText: "Confirm",
        type: "danger"
    });

    // Load userId from localStorage on mount
    useEffect(() => {
        const storedId = localStorage.getItem("taskstack_pin_id");
        if (storedId) {
            setUserId(storedId);
        }
    }, []);

    const triggerCreativeRefresh = useCallback(() => {
        setCreativeRefreshTrigger(prev => prev + 1);
    }, []);

    // Sync userId to localStorage and seed data
    useEffect(() => {
        if (userId) {
            localStorage.setItem("taskstack_pin_id", userId);
            // Seed data if this is a new user (or ensure it exists)
            seedProductivityData(userId).then(() => {
                triggerCreativeRefresh();
            });
        }
    }, [userId, triggerCreativeRefresh]);

    const onboardGuest = useCallback(async () => {
        let isUnique = false;
        let guestId = "";

        // Retry loop to ensure PIN uniqueness
        while (!isUnique) {
            const pin = Math.floor(100000 + Math.random() * 900000).toString();
            guestId = `up_${pin}`;
            const exists = await checkUserExistence(guestId);
            if (!exists) {
                isUnique = true;
            }
        }

        setUserId(guestId);
    }, []);

    const refreshChallenges = useCallback(async (background = false) => {
        if (!userId) {
            setIsLoadingChallenges(false);
            return;
        }
        if (!background) setIsLoadingChallenges(true);
        try {
            const data = await getChallenges(userId);
            setChallenges(data || []);

            // Also refresh track deadlines
            const { getAllTrackDeadlines } = await import("@/services/productivity-service");
            const deadlines = await getAllTrackDeadlines(userId);
            setTrackDeadlines(deadlines);
        } catch (err) {
            console.error("Failed to fetch challenges", err);
        } finally {
            if (!background) setIsLoadingChallenges(false);
        }
    }, [userId]);

    const refreshCurrentEnergy = useCallback(async () => {
        if (!userId) return;
        try {
            const data = await getEnergyData(userId);
            if (data && data.length > 0) {
                // Get the most recent level (latest is at index 0 because we prepend)
                const latest = data[0].level;
                setCurrentEnergy(latest);
            }
        } catch (err) {
            console.error("Failed to fetch energy data", err);
        }
    }, [userId]);

    const handleLogEnergyLevel = async (input: { level: number, notes?: string }) => {
        if (!userId) return;
        await logEnergyService(userId, input);
        await refreshCurrentEnergy();
        triggerCreativeRefresh();
    };

    useEffect(() => {
        if (userId) {
            refreshChallenges();
            refreshCurrentEnergy();
        }
    }, [refreshChallenges, refreshCurrentEnergy, creativeRefreshTrigger, userId]);

    const handleSaveChallenge = async (challenge: Omit<Challenge, "id">) => {
        if (!userId) return;
        await saveChallengeService(userId, challenge);
        await refreshChallenges(true);
    };

    const handleUpdateChallenge = async (id: string, updates: any) => {
        if (!userId) return;
        const { updateChallenge } = await import('@/services/productivity-service');
        await updateChallenge(userId, { challengeId: id, updates });
        await refreshChallenges(true);
    };

    const handleDeleteChallenge = async (id: string) => {
        if (!userId) return;
        const { deleteChallenge } = await import('@/services/productivity-service');
        await deleteChallenge(userId, id);
        await refreshChallenges(true);
    };

    const handleDeleteRoleTrack = async (role: string) => {
        if (!userId) return;
        const { deleteRoleTrack } = await import('@/services/productivity-service');
        await deleteRoleTrack(userId, role);
        await refreshChallenges(true);
    };

    const handleToggleChallenge = async (challengeId: string, completed?: boolean, stepId?: string) => {
        if (!userId) return;

        // Optimistic update for step toggle
        if (stepId) {
            setChallenges(prev => prev.map(c => {
                if (c.id === challengeId) {
                    const updatedSteps = c.steps.map(s => s.id === stepId ? { ...s, completed: !s.completed } : s);
                    const allDone = updatedSteps.every(s => s.completed);
                    return { ...c, steps: updatedSteps, completed: allDone };
                }
                return c;
            }));
        } else {
            // Optimistic update for whole challenge toggle
            setChallenges(prev => prev.map(c =>
                c.id === challengeId ? { ...c, completed: completed ?? !c.completed } : c
            ));
        }

        try {
            await toggleChallengeService(userId, { challengeId, completed, stepId });
        } catch (err) {
            console.error("Failed to toggle challenge", err);
            refreshChallenges(); // Rollback
        }
    };

    const abortExpansion = useCallback((challengeId: string) => {
        cancelledExpansions.current.add(challengeId);
        setExpandingIds(prev => prev.filter(id => id !== challengeId));
    }, []);

    const expandChallengeDetails = useCallback(async (challengeId: string) => {
        if (!userId) return;
        // Reset cancellation state for this ID
        cancelledExpansions.current.delete(challengeId);
        setExpandingIds(prev => [...prev, challengeId]);
        try {
            await expandChallengeService(userId, challengeId);
            
            // Check if user cancelled while we were waiting
            if (cancelledExpansions.current.has(challengeId)) {
                cancelledExpansions.current.delete(challengeId);
                console.log(`Expansion for ${challengeId} was cancelled, ignoring results.`);
                return;
            }

            await refreshChallenges(true);
            triggerCreativeRefresh(); // Refresh links as well
        } catch (err) {
            console.error("Failed to expand challenge", err);
        } finally {
            setExpandingIds(prev => prev.filter(id => id !== challengeId));
        }
    }, [userId, refreshChallenges, triggerCreativeRefresh]);

    const handleAddChallengeStep = async (challengeId: string, title: string) => {
        if (!userId) return;
        const { addChallengeStep } = await import('@/services/productivity-service');
        await addChallengeStep(userId, { challengeId, title });
        await refreshChallenges(true);
    };

    const handleUpdateChallengeStep = async (challengeId: string, stepId: string, title: string) => {
        if (!userId) return;
        const { updateChallengeStep } = await import('@/services/productivity-service');
        await updateChallengeStep(userId, { challengeId, stepId, title });
        await refreshChallenges(true);
    };

    const handleDeleteChallengeStep = async (challengeId: string, stepId: string) => {
        if (!userId) return;
        const { deleteChallengeStep } = await import('@/services/productivity-service');
        await deleteChallengeStep(userId, { challengeId, stepId });
        await refreshChallenges(true);
    };

    const startPomodoro = useCallback(async (props: Partial<PomodoroState>) => {
        if (userId) {
            await startPomodoroService(userId);
        }
        setPomodoro(prev => ({
            ...prev,
            ...props,
            timeLeft: props.workDuration ? props.workDuration * 60 : prev.timeLeft,
            isRunning: true
        }));
    }, [userId]);

    const pausePomodoro = useCallback(() => setPomodoro(prev => ({ ...prev, isRunning: false })), []);

    const resetPomodoro = useCallback(() => setPomodoro(prev => ({
        ...prev,
        isRunning: false,
        timeLeft: prev.workDuration * 60,
        sessionType: "work"
    })), []);

    const updatePomodoroDurations = useCallback((work: number, breakD: number, long: number) => {
        setPomodoro(prev => {
            if (prev.workDuration === work && prev.breakDuration === breakD && prev.longBreakDuration === long) {
                return prev;
            }
            return {
                ...prev,
                workDuration: work,
                breakDuration: breakD,
                longBreakDuration: long,
                timeLeft: prev.isRunning ? prev.timeLeft : work * 60
            };
        });
    }, []);

    const tickPomodoro = useCallback(() => {
        setPomodoro(prev => {
            if (!prev.isRunning || prev.timeLeft <= 0) return prev;

            const newTime = prev.timeLeft - 1;
            if (newTime === 0) {
                return { ...prev, timeLeft: 0, isRunning: false };
            }
            return { ...prev, timeLeft: newTime };
        });
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (pomodoro.isRunning) {
            interval = setInterval(tickPomodoro, 1000);
        }
        return () => clearInterval(interval);
    }, [pomodoro.isRunning, tickPomodoro]);

    const handleSetTrackDeadline = async (role: string, deadline: string) => {
        if (!userId) return;
        const { setTrackDeadline: setTrackDeadlineService } = await import("@/services/productivity-service");
        await setTrackDeadlineService(userId, role, deadline);
        setTrackDeadlines(prev => ({ ...prev, [role]: deadline }));
    };

    const openConfirm = useCallback((config: any) => {
        setConfirmState({ ...config, isOpen: true });
    }, []);

    const closeConfirm = useCallback(() => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
    }, []);

    return (
        <ProductivityContext.Provider value={{
            challenges, isLoadingChallenges, expandingIds, refreshChallenges, toggleChallenge: handleToggleChallenge, expandChallengeDetails, abortExpansion,
            saveChallenge: handleSaveChallenge, updateChallenge: handleUpdateChallenge, deleteChallenge: handleDeleteChallenge,
            deleteRoleTrack: handleDeleteRoleTrack,
            addChallengeStep: handleAddChallengeStep, updateChallengeStep: handleUpdateChallengeStep, deleteChallengeStep: handleDeleteChallengeStep,
            pomodoro: {
                ...pomodoro,
                sessionsCompleted: pomodoro.sessionsToday,
            },
            startPomodoro, pausePomodoro, resetPomodoro, tickPomodoro, updatePomodoroDurations,
            activeView, setActiveView, isChatOpen, setIsChatOpen,
            expandedId, setExpandedId,
            collapsedRoles, setCollapsedRoles,
            creativeRefreshTrigger, triggerCreativeRefresh,
            userId, setUserId, onboardGuest,
            currentEnergy, refreshCurrentEnergy, logEnergyLevel: handleLogEnergyLevel,
            trackDeadlines,
            setTrackDeadline: handleSetTrackDeadline,
            confirmState,
            openConfirm,
            closeConfirm
        }}>
            {children}
        </ProductivityContext.Provider>
    );
}

export const useProductivity = () => {
    const context = useContext(ProductivityContext);
    if (!context) throw new Error("useProductivity must be used within ProductivityProvider");
    return context;
};
