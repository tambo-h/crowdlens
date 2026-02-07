/**
 * @file pomodoro-timer.tsx
 * @description Tambo generative component for Pomodoro timer
 */

"use client";

import { z } from "zod";
import { useState, useEffect } from "react";

export const pomodoroTimerSchema = z.object({
  workDuration: z.number().default(25).describe("Work duration in minutes"),
  breakDuration: z.number().default(5).describe("Break duration in minutes"),
  longBreakDuration: z.number().default(15).describe("Long break duration in minutes"),
  autoStart: z.boolean().default(false).describe("Auto-start next session"),
  projectName: z.string().optional().describe("Optional project tag for this session"),
});

type PomodoroTimerProps = z.infer<typeof pomodoroTimerSchema>;

export function PomodoroTimer({
  workDuration = 25,
  breakDuration = 5,
  longBreakDuration = 15,
  autoStart = false,
  projectName,
}: PomodoroTimerProps) {
  // Use props for initial state, but we'll also sync them in useEffect
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<"work" | "break" | "longBreak">("work");
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // Sync state with props changes (important for streaming generative props)
  useEffect(() => {
    if (!isRunning) {
      const newTime =
        sessionType === "work" ? workDuration * 60 :
          sessionType === "break" ? breakDuration * 60 :
            longBreakDuration * 60;
      setTimeLeft(newTime);
    }
  }, [workDuration, breakDuration, longBreakDuration, sessionType, isRunning]);

  const totalSeconds =
    sessionType === "work" ? workDuration * 60 :
      sessionType === "break" ? breakDuration * 60 :
        longBreakDuration * 60;

  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Session complete
      if (sessionType === "work") {
        setSessionsCompleted((prev) => prev + 1);
        const nextType = (sessionsCompleted + 1) % 4 === 0 ? "longBreak" : "break";
        setSessionType(nextType);
        // We setTimeLeft here immediately to avoid the sync useEffect jumping back
        setTimeLeft(nextType === "longBreak" ? longBreakDuration * 60 : breakDuration * 60);
      } else {
        setSessionType("work");
        setTimeLeft(workDuration * 60);
      }

      if (autoStart) {
        setIsRunning(true);
      } else {
        setIsRunning(false);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, sessionType, workDuration, breakDuration, longBreakDuration, autoStart, sessionsCompleted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartPause = () => setIsRunning(!isRunning);
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(sessionType === "work" ? workDuration * 60 :
      sessionType === "break" ? breakDuration * 60 :
        longBreakDuration * 60);
  };

  return (
    <div className="bg-card rounded-xl p-8 shadow-lg border border-border max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Pomodoro Timer</h2>
        {projectName && (
          <p className="text-sm text-muted-foreground">
            Project: <span className="font-medium text-primary">{projectName}</span>
          </p>
        )}
      </div>

      {/* Session Type Badge */}
      <div className="flex justify-center mb-6">
        <span className={`px-4 py-1 rounded-full text-sm font-medium ${sessionType === "work"
            ? "bg-primary/20 text-primary border border-primary/30"
            : sessionType === "break"
              ? "bg-accent/20 text-accent border border-accent/30"
              : "bg-secondary/20 text-secondary border border-secondary/30"
          }`}>
          {sessionType === "work" ? "🎯 Focus Time" : sessionType === "break" ? "☕ Short Break" : "🌟 Long Break"}
        </span>
      </div>

      {/* Circular Progress */}
      <div className="relative w-64 h-64 mx-auto mb-6">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-muted/30"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            className={sessionType === "work" ? "text-primary" : "text-accent"}
            strokeLinecap="round"
          />
        </svg>
        {/* Time display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl font-bold text-foreground">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center mb-6">
        <button
          onClick={handleStartPause}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${isRunning
              ? "bg-accent text-accent-foreground hover:opacity-90"
              : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
        >
          {isRunning ? "⏸ Pause" : "▶ Start"}
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-3 rounded-lg font-medium bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity"
        >
          🔄 Reset
        </button>
      </div>

      {/* Session Counter */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Sessions completed today: <span className="font-bold text-foreground">{sessionsCompleted}</span>
        </p>
        <div className="flex justify-center gap-1 mt-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${i < sessionsCompleted % 4 ? "bg-primary" : "bg-muted"
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
