"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Target, Search, Timer, Zap, ArrowRight, ArrowLeft, X, CheckCircle2, ShieldCheck, LifeBuoy } from "lucide-react";
import { cn } from "@/lib/utils";

const ONBOARDING_STEPS = [
  {
    title: "Welcome to TaskStack",
    subtitle: "Productivity OS",
    description: "An AI-powered operating system for your professional and personal growth. We help you stay focused, organized, and aware of your energy levels.",
    icon: <Sparkles className="w-12 h-12 text-primary" />,
    color: "from-primary/20 to-primary/5",
    accent: "bg-primary"
  },
  {
    title: "AI Skill Tracks",
    subtitle: "Adaptive Learning",
    description: "Instead of static to-do lists, describe your goals to the AI. It generates structured milestones, action steps, and deadlines tailored specifically to you.",
    icon: <Target className="w-12 h-12 text-accent" />,
    color: "from-accent/20 to-accent/5",
    accent: "bg-accent"
  },
  {
    title: "Global Search (⌘K)",
    subtitle: "Deep Navigation",
    description: "Press Command+K from anywhere to search every track, challenge, and subtask. We'll automatically scroll and expand the exact card you're looking for.",
    icon: <Search className="w-12 h-12 text-blue-400" />,
    color: "from-blue-500/20 to-blue-500/5",
    accent: "bg-blue-400"
  },
  {
    title: "Deep Focus Flow",
    subtitle: "Time Management",
    description: "Our integrated Pomodoro timer helps you hit the 'flow state'. Every session you complete is tracked and visualized in your daily momentum stats.",
    icon: <Timer className="w-12 h-12 text-orange-400" />,
    color: "from-orange-500/20 to-orange-500/5",
    accent: "bg-orange-400"
  },
  {
    title: "Energy Awareness",
    subtitle: "Cognitive Balance",
    description: "Track your energy levels throughout the day. TaskStack helps you know when to push hard and when to switch to 'Recovery Mode' to avoid burnout.",
    icon: <Zap className="w-12 h-12 text-indigo-400" />,
    color: "from-indigo-500/20 to-indigo-500/5",
    accent: "bg-indigo-400"
  }
];

export function AppOnboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeen = localStorage.getItem("taskstack_seen_onboarding_v2");
    if (!hasSeen) {
      // Delay it slightly for entry effect
      setTimeout(() => setIsOpen(true), 2000);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("taskstack_seen_onboarding_v2", "true");
    setIsOpen(false);
  };

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 isolate">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-2xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="relative w-full max-w-2xl bg-card border border-border/80 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] rounded-[3rem] overflow-hidden"
          >
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-40 transition-colors duration-700", step.color)} />
            
            <div className="relative z-10 p-8 sm:p-12">
              <button 
                onClick={handleClose}
                className="absolute top-8 right-8 p-2 rounded-full hover:bg-muted/50 text-muted-foreground transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center space-y-8">
                <motion.div
                  key={`icon-${currentStep}`}
                  initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
                  animate={{ scale: 1.2, opacity: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200 }}
                  className="w-24 h-24 rounded-[2rem] bg-card border border-border flex items-center justify-center shadow-2xl mb-4"
                >
                  {step.icon}
                </motion.div>

                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground opacity-60">
                    Step {currentStep + 1} / {ONBOARDING_STEPS.length}
                  </h3>
                  <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-tighter leading-none mb-1">
                    {step.title}
                  </h2>
                  <p className="text-sm font-black uppercase tracking-widest text-primary/80">{step.subtitle}</p>
                </div>

                <p className="text-sm sm:text-lg text-muted-foreground font-medium leading-relaxed max-w-sm">
                  {step.description}
                </p>

                <div className="w-full flex items-center justify-center gap-2 pt-4">
                  {ONBOARDING_STEPS.map((_, i) => (
                    <div 
                      key={i}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-500",
                        i === currentStep ? "w-8 bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" : "w-1.5 bg-border/50"
                      )}
                    />
                  ))}
                </div>

                <div className="w-full flex gap-4 pt-12">
                  {currentStep > 0 && (
                    <button
                      onClick={prevStep}
                      className="flex-1 py-5 bg-muted/40 hover:bg-muted text-muted-foreground rounded-[2rem] font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-2 border border-border/50 shadow-sm"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                  )}
                  <button
                    onClick={nextStep}
                    className={cn(
                      "flex-1 py-5 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-2 shadow-2xl active:scale-[0.98] outline-none",
                      step.accent,
                      "hover:opacity-90"
                    )}
                  >
                    {currentStep === ONBOARDING_STEPS.length - 1 ? (
                      <>Get Started <CheckCircle2 className="w-4 h-4" /></>
                    ) : (
                      <>Continue <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>

                <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest pt-4">
                  Your local-first data is end-to-end encrypted
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
