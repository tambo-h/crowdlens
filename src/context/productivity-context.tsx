"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { HabitTrackerProps } from "@/components/productivity/habit-tracker";
import { getHabits, toggleHabit as toggleHabitService, startPomodoroSession as startPomodoroService } from "@/services/productivity-service";

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
    // Habits
    habits: any[];
    setHabits: React.Dispatch<React.SetStateAction<any[]>>;
    isLoadingHabits: boolean;
    refreshHabits: () => Promise<void>;
    toggleHabit: (habitId: string) => Promise<void>;

    // Pomodoro
    pomodoro: PomodoroState;
    startPomodoro: (props: Partial<PomodoroState>) => void;
    pausePomodoro: () => void;
    resetPomodoro: () => void;
    tickPomodoro: () => void;
    updatePomodoroDurations: (work: number, breakD: number, long: number) => void;

    // View Management
    activeView: string;
    setActiveView: (view: any) => void;
    isChatOpen: boolean;
    setIsChatOpen: (open: boolean) => void;

    // Creative Tools Sync
    creativeRefreshTrigger: number;
    triggerCreativeRefresh: () => void;
}

const ProductivityContext = createContext<ProductivityContextType | undefined>(undefined);

export function ProductivityProvider({ children }: { children: React.ReactNode }) {
    const [activeView, setActiveView] = useState("dashboard");
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [creativeRefreshTrigger, setCreativeRefreshTrigger] = useState(0);

    const triggerCreativeRefresh = useCallback(() => {
        setCreativeRefreshTrigger(prev => prev + 1);
    }, []);

    // Habits state
    const [habits, setHabits] = useState<any[]>([]);
    const [isLoadingHabits, setIsLoadingHabits] = useState(true);

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

    const refreshHabits = useCallback(async () => {
        setIsLoadingHabits(true);
        try {
            const data = await getHabits({});
            setHabits(data);
        } catch (err) {
            console.error("Failed to fetch habits", err);
        } finally {
            setIsLoadingHabits(false);
        }
    }, []);

    useEffect(() => {
        refreshHabits();
    }, [refreshHabits]);

    const toggleHabitAction = async (habitId: string) => {
        // Optimistic update
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return;

        const newStatus = !habit.completedToday;
        setHabits(prev => prev.map(h =>
            h.id === habitId ? { ...h, completedToday: newStatus, streak: newStatus ? h.streak + 1 : h.streak - 1 } : h
        ));

        try {
            await toggleHabitService({ habitId, completed: newStatus });
        } catch (err) {
            console.error("Failed to toggle habit", err);
            refreshHabits(); // Rollback
        }
    };

    const startPomodoro = (props: Partial<PomodoroState>) => {
        setPomodoro(prev => ({
            ...prev,
            ...props,
            timeLeft: props.workDuration ? props.workDuration * 60 : prev.timeLeft,
            isRunning: true
        }));
    };

    const pausePomodoro = () => setPomodoro(prev => ({ ...prev, isRunning: false }));

    const resetPomodoro = () => setPomodoro(prev => ({
        ...prev,
        isRunning: false,
        timeLeft: prev.workDuration * 60,
        sessionType: "work"
    }));

    const updatePomodoroDurations = (work: number, breakD: number, long: number) => {
        setPomodoro(prev => ({
            ...prev,
            workDuration: work,
            breakDuration: breakD,
            longBreakDuration: long,
            timeLeft: prev.isRunning ? prev.timeLeft : work * 60
        }));
    };

    const tickPomodoro = useCallback(() => {
        setPomodoro(prev => {
            if (!prev.isRunning || prev.timeLeft <= 0) return prev;

            const newTime = prev.timeLeft - 1;
            if (newTime === 0) {
                // Handle session switch logic here or in a separate effect
                // For simplicity in context, we'll just stop for now or handle in component
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
            habits, setHabits, isLoadingHabits, refreshHabits, toggleHabit: toggleHabitAction,
            pomodoro, startPomodoro, pausePomodoro, resetPomodoro, tickPomodoro, updatePomodoroDurations,
            activeView, setActiveView, isChatOpen, setIsChatOpen,
            creativeRefreshTrigger, triggerCreativeRefresh
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
