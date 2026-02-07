"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { HabitTrackerProps } from "@/components/productivity/habit-tracker";
import { getHabits, toggleHabit as toggleHabitService, startPomodoroSession as startPomodoroService, seedProductivityData } from "@/services/productivity-service";

interface PomodoroState {
    isRunning: boolean;
    timeLeft: number;
    sessionType: "work" | "break" | "longBreak";
    sessionsCompleted: number;
    workDuration: number;
    breakDuration: number;
    longBreakDuration: number;
    projectName?: string;
}

interface ProductivityContextType {
    // Auth/User
    userId: string | null;
    setUserId: React.Dispatch<React.SetStateAction<string | null>>;
    onboardGuest: () => void;

    // Habits
    habits: any[];
    isLoadingHabits: boolean;
    refreshHabits: () => Promise<void>;
    toggleHabit: (habitId: string, completed: boolean) => Promise<void>;

    // Pomodoro
    pomodoro: PomodoroState;
    startPomodoro: (props: Partial<PomodoroState>) => void;
    pausePomodoro: () => void;
    resetPomodoro: () => void;
    tickPomodoro: () => void;
    updatePomodoroDurations: (work: number, breakD: number, long: number) => void;

    // View Management
    activeView: string;
    setActiveView: (view: string) => void;
    isChatOpen: boolean;
    setIsChatOpen: (open: boolean) => void;

    // Creative Tools Sync
    creativeRefreshTrigger: number;
    triggerCreativeRefresh: () => void;
}

const ProductivityContext = createContext<ProductivityContextType | undefined>(undefined);

export function ProductivityProvider({ children }: { children: React.ReactNode }) {
    const [userId, setUserId] = useState<string | null>(null);
    const [activeView, setActiveView] = useState("dashboard");
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [creativeRefreshTrigger, setCreativeRefreshTrigger] = useState(0);

    // Habits state
    const [habits, setHabits] = useState<any[]>([]);
    const [isLoadingHabits, setIsLoadingHabits] = useState(false);

    // Pomodoro state
    const [pomodoro, setPomodoro] = useState<PomodoroState>({
        isRunning: false,
        timeLeft: 25 * 60,
        sessionType: "work",
        sessionsCompleted: 0,
        workDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
    });

    // Load userId from localStorage on mount
    useEffect(() => {
        const storedId = localStorage.getItem("crowdlens_user_id");
        if (storedId) {
            setUserId(storedId);
        }
    }, []);

    // Sync userId to localStorage and seed data
    useEffect(() => {
        if (userId) {
            localStorage.setItem("crowdlens_user_id", userId);
            // Seed data if this is a new user (or ensure it exists)
            seedProductivityData(userId).then(() => {
                triggerCreativeRefresh();
            });
        }
    }, [userId]);

    const triggerCreativeRefresh = useCallback(() => {
        setCreativeRefreshTrigger(prev => prev + 1);
    }, []);

    const onboardGuest = useCallback(() => {
        const guestId = `guest_${Math.random().toString(36).substring(2, 11)}`;
        setUserId(guestId);
    }, []);

    const refreshHabits = useCallback(async () => {
        if (!userId) {
            setIsLoadingHabits(false);
            return;
        }
        setIsLoadingHabits(true);
        try {
            const data = await getHabits(userId);
            setHabits(data || []);
        } catch (err) {
            console.error("Failed to fetch habits", err);
        } finally {
            setIsLoadingHabits(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            refreshHabits();
        }
    }, [refreshHabits, creativeRefreshTrigger, userId]);

    const handleToggleHabit = async (habitId: string, completed: boolean) => {
        if (!userId) return;

        // Optimistic update
        setHabits(prev => prev.map(h =>
            h.id === habitId ? { ...h, completedToday: completed, streak: completed ? h.streak + 1 : h.streak - 1 } : h
        ));

        try {
            await toggleHabitService(userId, { habitId, completed });
        } catch (err) {
            console.error("Failed to toggle habit", err);
            refreshHabits(); // Rollback
        }
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

    return (
        <ProductivityContext.Provider value={{
            habits, isLoadingHabits, refreshHabits, toggleHabit: handleToggleHabit,
            pomodoro, startPomodoro, pausePomodoro, resetPomodoro, tickPomodoro, updatePomodoroDurations,
            activeView, setActiveView, isChatOpen, setIsChatOpen,
            creativeRefreshTrigger, triggerCreativeRefresh,
            userId, setUserId, onboardGuest
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
