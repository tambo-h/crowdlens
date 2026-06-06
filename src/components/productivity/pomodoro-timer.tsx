/**
 * @file pomodoro-timer.tsx
 * @description Enhanced Pomodoro focus engine with custom tabbed navigation (Timer, Stats, Settings)
 */

"use client";

import { z } from "zod";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";

export const pomodoroTimerSchema = z.object({
  workDuration: z.number().default(25).describe("Work duration in minutes"),
  breakDuration: z.number().default(5).describe("Break duration in minutes"),
  longBreakDuration: z.number().default(15).describe("Long break duration in minutes"),
  autoStart: z.boolean().default(false).describe("Auto-start next session"),
  tickingSound: z.boolean().default(false).describe("Play ticking sound while the timer is running"),
  projectName: z.string().optional().describe("Optional project tag for this session"),
});

import { useProductivity } from "@/context/productivity-context";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Settings, 
  BarChart2, 
  Bell, 
  Sparkles, 
  Activity, 
  Play, 
  Pause, 
  Save, 
  ChevronRight, 
  Flame 
} from "lucide-react";
import { cn } from "@/lib/utils";

type PomodoroTimerProps = z.input<typeof pomodoroTimerSchema>;

function createPomodoroAudio() {
  if (typeof window === "undefined") return null;
  const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextCtor) return null;
  return new AudioContextCtor();
}

const isToday = (date: Date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

export function PomodoroTimer({
  workDuration: initialWork = 25,
  breakDuration: initialBreak = 5,
  longBreakDuration: initialLongBreak = 15,
  autoStart: _autoStart = false,
  tickingSound: tickingSoundDefault = false,
  projectName,
}: PomodoroTimerProps) {
  const { pomodoro, startPomodoro, pausePomodoro, resetPomodoro, updatePomodoroDurations, currentEnergy, userId } = useProductivity();
  const { timeLeft, isRunning, sessionType, sessionsCompleted, workDuration, breakDuration, longBreakDuration } = pomodoro;

  const [activeTab, setActiveTab] = useState<"timer" | "stats" | "settings">("timer");
  const [tickingSoundEnabled, setTickingSoundEnabled] = useState(tickingSoundDefault);
  const [history, setHistory] = useState<any[]>([]);

  // Settings form local state
  const [customWork, setCustomWork] = useState(workDuration);
  const [customBreak, setCustomBreak] = useState(breakDuration);
  const [customLongBreak, setCustomLongBreak] = useState(longBreakDuration);

  // Sync settings inputs when duration changes from props or elsewhere
  useEffect(() => {
    setCustomWork(workDuration);
    setCustomBreak(breakDuration);
    setCustomLongBreak(longBreakDuration);
  }, [workDuration, breakDuration, longBreakDuration]);

  // Audio nodes and references
  const audioContextRef = useRef<AudioContext | null>(null);
  const prevTimeLeftRef = useRef(timeLeft);

  // Load completed sessions history on mount and when timeLeft transitions (session finishes)
  const loadHistory = useCallback(() => {
    if (typeof window !== "undefined") {
      const key = `pomodoro_history_${userId || 'guest'}`;
      const data = JSON.parse(localStorage.getItem(key) || "[]");
      setHistory(data);
    }
  }, [userId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory, timeLeft]);

  // Request notifications permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        void Notification.requestPermission();
      }
    }
  }, []);

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

  useEffect(() => { 
    updatePomodoroDurations(initialWork, initialBreak, initialLongBreak); 
  }, [initialWork, initialBreak, initialLongBreak, updatePomodoroDurations]);

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

  // Notification and bell alert when timer hits zero
  useEffect(() => {
    if (isRunning && tickingSoundEnabled && timeLeft > 0 && prevTimeLeftRef.current !== timeLeft) void playTick();
    
    if (prevTimeLeftRef.current > 0 && timeLeft === 0 && !isRunning) {
      void playBell();
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        const title = sessionType === "work" ? "Focus Session Complete! ⏱️" : "Break Over! 🚀";
        const body = sessionType === "work" 
          ? "Great focus! Ready to take your recovery break?"
          : "Time to start another focus session and keep the momentum going!";
        new Notification(title, { body });
      }
    }
    prevTimeLeftRef.current = timeLeft;
  }, [isRunning, playBell, playTick, tickingSoundEnabled, timeLeft, sessionType]);

  // Save Settings
  const handleSaveSettings = () => {
    updatePomodoroDurations(customWork, customBreak, customLongBreak);
    resetPomodoro();
    setActiveTab("timer");
  };

  // Sound and alert test
  const handleTestAlert = async () => {
    await primeAudio();
    if (typeof window !== "undefined" && "Notification" in window) {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        new Notification("TaskStack Test", {
          body: "Chime sound and notifications are working perfectly!"
        });
      }
    }
    void playBell();
  };

  // Break suggestions calculation based on energy levels
  const breakSuggestion = useMemo(() => {
    if (currentEnergy === null) {
      return {
        title: "Log Energy Level",
        desc: "Add your energy score on the dashboard for personalized break coaching.",
        color: "text-muted-foreground",
        borderColor: "border-border",
        bgColor: "bg-muted/5",
      };
    }
    if (currentEnergy >= 8) {
      return {
        title: "High Energy Mode",
        desc: "Maintain momentum with an active break: do 10 jumping jacks, stretch, or grab a crisp glass of ice water.",
        color: "text-emerald-500 dark:text-emerald-400",
        borderColor: "border-emerald-500/20",
        bgColor: "bg-emerald-500/5",
      };
    }
    if (currentEnergy >= 5) {
      return {
        title: "Balanced Rest Mode",
        desc: "Optimal recovery break: rest your eyes, step away from screens, or practice the 20-20-20 rule (look 20 feet away).",
        color: "text-primary",
        borderColor: "border-primary/20",
        bgColor: "bg-primary/5",
      };
    }
    return {
      title: "Deep Recharge Mode",
      desc: "Energy is low: Close your eyes, practice deep diaphragmatic breathing, or enjoy a healthy snack.",
      color: "text-amber-500 dark:text-amber-400",
      borderColor: "border-amber-500/20",
      bgColor: "bg-amber-500/5",
    };
  }, [currentEnergy]);

  // Stats calculation
  const stats = useMemo(() => {
    const todayMinutes = history
      .filter(item => isToday(new Date(item.timestamp)))
      .reduce((acc, curr) => acc + curr.duration, 0);

    const totalMinutes = history.reduce((acc, curr) => acc + curr.duration, 0);

    // Get focus minutes per weekday for the last 7 days
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayLabel = d.toLocaleDateString(undefined, { weekday: "short" });
      const dayKey = d.toDateString();
      const value = history
        .filter(item => new Date(item.timestamp).toDateString() === dayKey)
        .reduce((acc, curr) => acc + curr.duration, 0);
      
      chartData.push({ label: dayLabel, value });
    }

    return { todayMinutes, totalMinutes, chartData };
  }, [history]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      className="bg-card/40 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 border border-border shadow-2xl max-w-md w-full mx-auto relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-50" />

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <span className="font-bold text-sm tracking-tight text-foreground">Focus Hub</span>
        </div>
        <div className="flex bg-muted/60 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("timer")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
              activeTab === "timer" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Timer
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
              activeTab === "stats" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Stats
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
              activeTab === "settings" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Settings
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "timer" && (
          <motion.div
            key="timer-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center"
          >
            {/* Header Title */}
            <div className="text-center mb-6">
              <span className="text-xs uppercase font-extrabold tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                {sessionType === "work" ? "Peak Focus" : sessionType === "break" ? "Short Rest" : "Long Rest"}
              </span>
              {projectName && (
                <p className="text-xs text-muted-foreground mt-2">
                  Task: <span className="text-primary font-bold">{projectName}</span>
                </p>
              )}
            </div>

            {/* Circular Timer Visual */}
            <div className="relative w-56 h-56 mx-auto mb-6 flex items-center justify-center">
              <motion.circle
                animate={{ rotate: isRunning ? 360 : 0 }}
                transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
                className="absolute inset-2 rounded-full border border-dashed border-primary/20 pointer-events-none"
              />

              <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_12px_rgba(var(--primary-rgb),0.15)]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="3.5" fill="none" className="text-muted/10" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - progress / 100) }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className={cn(sessionType === "work" ? "text-primary" : "text-accent")}
                  strokeLinecap="round"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  key={timeLeft}
                  initial={{ scale: 0.96 }}
                  animate={{ scale: 1 }}
                  className="text-4xl sm:text-5xl font-black text-foreground tabular-nums tracking-tighter"
                >
                  {formatTime(timeLeft)}
                </motion.span>
                <span className="text-[9px] font-black uppercase tracking-[.2em] text-muted-foreground mt-1">
                  {isRunning ? "Ticking" : "Paused"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center w-full max-w-xs mb-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartPause}
                className={cn(
                  "flex-1 h-12 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                  isRunning
                    ? "bg-accent text-accent-foreground shadow-lg shadow-accent/10"
                    : "bg-primary text-primary-foreground shadow-lg shadow-primary/10"
                )}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isRunning ? "Pause" : "Start Focus"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, rotate: 90 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => resetPomodoro()}
                className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Active Break Suggestions coaching card */}
            <div className={cn("w-full border rounded-2xl p-4 transition-all duration-300 mb-6", breakSuggestion.bgColor, breakSuggestion.borderColor)}>
              <div className="flex items-start gap-3">
                <Activity className={cn("w-4 h-4 mt-0.5", breakSuggestion.color)} />
                <div>
                  <h4 className={cn("text-xs font-bold uppercase tracking-wider mb-1", breakSuggestion.color)}>
                    {sessionType === "work" ? "Next Break Strategy" : "Break Coaching Action"}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {breakSuggestion.desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom dots */}
            <div className="w-full flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-2.5 h-2.5 rounded-full transition-all duration-300",
                        i < sessionsCompleted % 4 
                          ? "bg-primary scale-110 shadow-sm shadow-primary/20" 
                          : "bg-muted"
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-muted-foreground">{sessionsCompleted} Done Today</span>
              </div>
              <button
                onClick={() => setTickingSoundEnabled(!tickingSoundEnabled)}
                className={cn(
                  "p-2 rounded-lg transition-colors hover:bg-muted/50",
                  tickingSoundEnabled ? "text-primary bg-primary/10" : "text-muted-foreground"
                )}
                title={tickingSoundEnabled ? "Mute tick" : "Enable tick"}
              >
                {tickingSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === "stats" && (
          <motion.div
            key="stats-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Quick stats grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-muted/40 border border-border/50 p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-1">Today's Focus</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-foreground">{stats.todayMinutes}</span>
                  <span className="text-xs text-muted-foreground font-bold">mins</span>
                </div>
              </div>
              <div className="bg-muted/40 border border-border/50 p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-1">All-time Focus</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-foreground">{stats.totalMinutes}</span>
                  <span className="text-xs text-muted-foreground font-bold">mins</span>
                </div>
              </div>
            </div>

            {/* Weekly SVG Bar Chart */}
            <div className="bg-muted/30 border border-border/50 p-4 rounded-2xl mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Last 7 Days</h4>
              <div className="flex justify-center items-end">
                <svg viewBox="0 0 350 140" className="w-full h-32">
                  {/* Grid Lines */}
                  <line x1="10" y1="20" x2="340" y2="20" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4" />
                  <line x1="10" y1="60" x2="340" y2="60" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4" />
                  <line x1="10" y1="100" x2="340" y2="100" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4" />
                  
                  {stats.chartData.map((day, idx) => {
                    const maxVal = Math.max(...stats.chartData.map(d => d.value), 30);
                    const barHeight = (day.value / maxVal) * 90;
                    const x = 20 + idx * 45;
                    const y = 110 - barHeight;

                    return (
                      <g key={idx} className="group/bar">
                        {/* Interactive hover area */}
                        <rect x={x - 10} y={0} width={36} height={110} fill="transparent" className="cursor-pointer" />
                        {/* Rounded Bar */}
                        <motion.rect
                          initial={{ height: 0, y: 110 }}
                          animate={{ height: barHeight, y: y }}
                          transition={{ delay: idx * 0.03, duration: 0.4 }}
                          x={x}
                          width={16}
                          rx={5}
                          className={cn(
                            "fill-primary hover:fill-accent transition-colors duration-200",
                            day.value > 0 ? "opacity-100" : "opacity-20"
                          )}
                        />
                        {/* Value indicator on hover */}
                        <text
                          x={x + 8}
                          y={y - 6}
                          textAnchor="middle"
                          className="text-[9px] font-black fill-primary opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200"
                        >
                          {day.value}m
                        </text>
                        {/* Day name label */}
                        <text
                          x={x + 8}
                          y={128}
                          textAnchor="middle"
                          className="text-[9px] font-bold fill-muted-foreground"
                        >
                          {day.label}
                        </text>
                      </g>
                    );
                  })}
                  {/* Baseline */}
                  <line x1="10" y1="110" x2="340" y2="110" stroke="var(--border)" strokeWidth="1" />
                </svg>
              </div>
            </div>

            {/* Recent activity list */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Recent Focus Logs</h4>
              <div className="space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
                {history.length === 0 ? (
                  <p className="text-xs text-center text-muted-foreground py-4">No completed sessions logged yet.</p>
                ) : (
                  history.slice(0, 10).map((log, index) => (
                    <div key={log.id || index} className="flex justify-between items-center bg-muted/20 border border-border/30 p-2.5 rounded-xl text-xs">
                      <div className="flex items-center gap-2">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        <span className="font-semibold">Focus Session Completed</span>
                      </div>
                      <div className="text-right flex items-center gap-2 text-muted-foreground">
                        <span>{log.duration} min</span>
                        <span>•</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "settings" && (
          <motion.div
            key="settings-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {/* Work Duration Config */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Focus Session</label>
                <span className="text-xs font-black text-primary">{customWork} minutes</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={customWork}
                onChange={(e) => setCustomWork(Number(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Break Duration Config */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Short Break</label>
                <span className="text-xs font-black text-accent">{customBreak} minutes</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={customBreak}
                onChange={(e) => setCustomBreak(Number(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            {/* Long Break Duration Config */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Long Break</label>
                <span className="text-xs font-black text-foreground">{customLongBreak} minutes</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={customLongBreak}
                onChange={(e) => setCustomLongBreak(Number(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-muted-foreground"
              />
            </div>

            {/* Verification test button */}
            <div className="bg-muted/40 border border-border/50 rounded-2xl p-4 flex justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-primary" />
                <div>
                  <h4 className="text-xs font-bold text-foreground">Desktop Notifications</h4>
                  <p className="text-[10px] text-muted-foreground">Receive desktop alerts and chime sounds.</p>
                </div>
              </div>
              <button
                onClick={handleTestAlert}
                className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 text-[10px] font-black uppercase rounded-lg transition-all"
              >
                Test Sound
              </button>
            </div>

            {/* Save Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveSettings}
              className="w-full h-12 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-primary/10 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Configuration
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
