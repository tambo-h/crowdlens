/**
 * @file pomodoro-timer.tsx
 * @description Tambo generative component for Pomodoro timer
 */

"use client";

import { z } from "zod";
import { useCallback, useEffect, useRef, useState } from "react";

export const pomodoroTimerSchema = z.object({
  workDuration: z.number().default(25).describe("Work duration in minutes"),
  breakDuration: z.number().default(5).describe("Break duration in minutes"),
  longBreakDuration: z.number().default(15).describe("Long break duration in minutes"),
  autoStart: z.boolean().default(false).describe("Auto-start next session"),
  tickingSound: z.boolean().default(false).describe("Play ticking sound while the timer is running"),
  projectName: z.string().optional().describe("Optional project tag for this session"),
});

import { useProductivity } from "@/context/productivity-context";

type PomodoroTimerProps = z.input<typeof pomodoroTimerSchema>;

function createPomodoroAudio() {
  if (typeof window === "undefined") return null;
  const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextCtor) return null;
  return new AudioContextCtor();
}

export function PomodoroTimer({
  workDuration: initialWork = 25,
  breakDuration: initialBreak = 5,
  longBreakDuration: initialLongBreak = 15,
  autoStart: _autoStart = false,
  tickingSound: tickingSoundDefault = false,
  projectName,
}: PomodoroTimerProps) {
  const { pomodoro, startPomodoro, pausePomodoro, resetPomodoro, updatePomodoroDurations } = useProductivity();
  const { timeLeft, isRunning, sessionType, sessionsCompleted, workDuration, breakDuration, longBreakDuration } = pomodoro;

  const [tickingSoundEnabled, setTickingSoundEnabled] = useState(tickingSoundDefault);

  const audioContextRef = useRef<AudioContext | null>(null);
  const prevTimeLeftRef = useRef(timeLeft);

  const primeAudio = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!audioContextRef.current) {
      audioContextRef.current = createPomodoroAudio();
    }
    if (!audioContextRef.current) return;

    if (audioContextRef.current.state === "suspended") {
      try {
        await audioContextRef.current.resume();
      } catch {
        // Best-effort. Some browsers require a user gesture.
      }
    }
  }, []);

  const playTone = useCallback(async (options: { frequency: number; durationMs: number; gain: number; type?: OscillatorType }) => {
    await primeAudio();
    const audioContext = audioContextRef.current;
    if (!audioContext || audioContext.state !== "running") return;

    const oscillator = audioContext.createOscillator();
    oscillator.type = options.type ?? "sine";
    oscillator.frequency.value = options.frequency;

    const gain = audioContext.createGain();
    gain.gain.value = 0;

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    const now = audioContext.currentTime;
    const durationSec = Math.max(0.01, options.durationMs / 1000);
    const maxGain = Math.max(0, options.gain);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(maxGain, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    oscillator.start(now);
    oscillator.stop(now + durationSec);
  }, [primeAudio]);

  const playTick = useCallback(() => {
    return playTone({ frequency: 1100, durationMs: 35, gain: 0.03, type: "square" });
  }, [playTone]);

  const playBell = useCallback(async () => {
    await primeAudio();
    const audioContext = audioContextRef.current;
    if (!audioContext || audioContext.state !== "running") return;

    const now = audioContext.currentTime;
    const output = audioContext.createGain();
    output.gain.value = 0;
    output.connect(audioContext.destination);
    output.gain.setValueAtTime(0.0001, now);
    output.gain.linearRampToValueAtTime(0.12, now + 0.01);
    output.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

    const osc1 = audioContext.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, now);
    osc1.frequency.exponentialRampToValueAtTime(392, now + 0.9);
    osc1.connect(output);
    osc1.start(now);
    osc1.stop(now + 0.9);

    const osc2 = audioContext.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(783.99, now);
    osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.9);
    osc2.connect(output);
    osc2.start(now);
    osc2.stop(now + 0.9);
  }, [primeAudio]);

  useEffect(() => {
    return () => {
      const audioContext = audioContextRef.current;
      audioContextRef.current = null;

      if (!audioContext) return;
      try {
        void audioContext.close();
      } catch {
        // Ignore
      }
    };
  }, []);

  // Initialize durations in context if they differ from initial props
  useEffect(() => {
    updatePomodoroDurations(initialWork, initialBreak, initialLongBreak);
  }, [initialWork, initialBreak, initialLongBreak, updatePomodoroDurations]);

  const totalSeconds =
    sessionType === "work" ? workDuration * 60 :
      sessionType === "break" ? breakDuration * 60 :
        longBreakDuration * 60;

  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartPause = () => {
    void primeAudio();

    if (isRunning) pausePomodoro();
    else startPomodoro({});
  };

  const handleReset = () => resetPomodoro();

  useEffect(() => {
    const prevTimeLeft = prevTimeLeftRef.current;
    prevTimeLeftRef.current = timeLeft;

    if (isRunning && tickingSoundEnabled && timeLeft > 0 && prevTimeLeft !== timeLeft) {
      void playTick();
    }

    if (prevTimeLeft > 0 && timeLeft === 0 && !isRunning) {
      void playBell();
    }
  }, [isRunning, playBell, playTick, tickingSoundEnabled, timeLeft]);

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

      <div className="flex justify-center mb-6">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={tickingSoundEnabled}
            onChange={(e) => {
              const next = e.currentTarget.checked;
              setTickingSoundEnabled(next);
              if (next) void primeAudio();
            }}
            className="h-4 w-4 accent-primary"
          />
          Play ticking sound while running
        </label>
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
