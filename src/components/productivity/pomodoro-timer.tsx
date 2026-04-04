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
import { motion } from "framer-motion";
import { Clock, RotateCcw, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
      try { await audioContextRef.current.resume(); } catch { }
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

  const playTick = useCallback(() => playTone({ frequency: 1100, durationMs: 35, gain: 0.03, type: "square" }), [playTone]);

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
    osc1.frequency.setValueAtTime(523.25, now);
    osc1.frequency.exponentialRampToValueAtTime(392, now + 0.9);
    osc1.connect(output);
    osc1.start(now);
    osc1.stop(now + 0.9);
  }, [primeAudio]);

  useEffect(() => {
    return () => {
      const audioContext = audioContextRef.current;
      audioContextRef.current = null;
      if (audioContext) try { void audioContext.close(); } catch { }
    };
  }, []);

  useEffect(() => { updatePomodoroDurations(initialWork, initialBreak, initialLongBreak); }, [initialWork, initialBreak, initialLongBreak, updatePomodoroDurations]);

  const totalSeconds = sessionType === "work" ? workDuration * 60 : sessionType === "break" ? breakDuration * 60 : longBreakDuration * 60;
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

  useEffect(() => {
    if (isRunning && tickingSoundEnabled && timeLeft > 0 && prevTimeLeftRef.current !== timeLeft) void playTick();
    if (prevTimeLeftRef.current > 0 && timeLeft === 0 && !isRunning) void playBell();
    prevTimeLeftRef.current = timeLeft;
  }, [isRunning, playBell, playTick, tickingSoundEnabled, timeLeft]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      className="bg-card/40 backdrop-blur-xl rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 border border-border shadow-2xl max-w-lg w-full mx-auto relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-50" />

      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
          <Clock className="w-3 h-3" /> Focus Engine
        </div>
        <h2 className="text-3xl font-black text-foreground tracking-tight">
          {sessionType === "work" ? "Peak Focus" : "Creative Rest"}
        </h2>
        {projectName && <p className="text-sm text-muted-foreground mt-2 font-medium">Project: <span className="text-primary">{projectName}</span></p>}
      </div>

      {/* Circular Progress */}
      <div className="relative w-52 h-52 sm:w-72 sm:h-72 md:w-80 md:h-80 mx-auto mb-6 sm:mb-10">
        <motion.div
          animate={{ rotate: isRunning ? 360 : 0 }}
          transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
          className="absolute inset-4 rounded-full border border-dashed border-primary/20"
        />

        <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_20px_rgba(99,102,241,0.2)]" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="4" fill="none" className="text-muted/10" />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 45}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - progress / 100) }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={sessionType === "work" ? "text-primary" : "text-accent"}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={timeLeft}
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl sm:text-7xl font-black text-foreground tabular-nums tracking-tighter"
          >
            {formatTime(timeLeft)}
          </motion.span>
          <span className="text-[10px] font-black uppercase tracking-[.3em] text-muted-foreground mt-1">
            Running Mode
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 sm:gap-4 justify-center mb-6 sm:mb-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartPause}
          className={cn(
            "h-14 sm:h-16 px-6 sm:px-10 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all shadow-xl",
            isRunning
              ? "bg-accent text-accent-foreground shadow-accent/20"
              : "bg-primary text-primary-foreground shadow-primary/20"
          )}
        >
          {isRunning ? "Pause Session" : "Start Focus"}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, rotate: 180 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => resetPomodoro()}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
        >
          <RotateCcw className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Footer Stats */}
      <footer className="pt-8 border-t border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  scale: i < sessionsCompleted % 4 ? 1.2 : 1,
                  backgroundColor: i < sessionsCompleted % 4 ? "var(--primary)" : "var(--muted)"
                }}
                className="w-2.5 h-2.5 rounded-full"
              />
            ))}
          </div>
          <span className="text-xs font-bold text-muted-foreground">{sessionsCompleted} Finished Today</span>
        </div>

        <button
          onClick={() => setTickingSoundEnabled(!tickingSoundEnabled)}
          className={cn(
            "p-2 rounded-lg transition-colors",
            tickingSoundEnabled ? "text-primary bg-primary/10" : "text-muted-foreground"
          )}
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </footer>
    </motion.div>
  );
}
