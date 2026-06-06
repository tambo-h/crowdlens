"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Target, Search, Timer, Zap, ArrowRight, ArrowLeft, X, CheckCircle2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProductivity } from "@/context/productivity-context";

const TUTORIAL_STEPS = [
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
  },
  {
    title: "Build Your Persona",
    subtitle: "Custom AI Guidance",
    description: "Help the AI customize your skill tracks. Every field is optional, and you can edit them at any time.",
    icon: <User className="w-12 h-12 text-emerald-400" />,
    color: "from-emerald-500/20 to-emerald-500/5",
    accent: "bg-emerald-500"
  }
];

export function AppOnboarding() {
  const { isOnboardingOpen, setIsOnboardingOpen, savePersona, persona, isProcessingAI } = useProductivity();
  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    city: "",
    workDesignation: "",
    interests: ""
  });

  useEffect(() => {
    if (persona) {
      setFormData({
        name: persona.name || "",
        age: persona.age || "",
        gender: persona.gender || "",
        city: persona.city || "",
        workDesignation: persona.workDesignation || "",
        interests: persona.interests || ""
      });
    }
  }, [persona]);

  useEffect(() => {
    const hasSeen = localStorage.getItem("taskstack_seen_onboarding_v2");
    if (!hasSeen) {
      // Delay it slightly for entry effect
      setTimeout(() => setIsOnboardingOpen(true), 2000);
    }
  }, [setIsOnboardingOpen]);

  useEffect(() => {
    if (isOnboardingOpen) {
      const hasSeen = localStorage.getItem("taskstack_seen_onboarding_v2");
      if (hasSeen === "true") {
        setCurrentStep(5); // Go directly to the Persona step
      } else {
        setCurrentStep(0);
      }
    }
  }, [isOnboardingOpen]);

  const handleClose = () => {
    localStorage.setItem("taskstack_seen_onboarding_v2", "true");
    setIsOnboardingOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await savePersona(formData);
    handleClose();
  };

  const nextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last step: Save persona
      savePersona(formData).then(() => {
        handleClose();
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = TUTORIAL_STEPS[currentStep];
  const isPersonaStep = currentStep === 5;

  return (
    <AnimatePresence>
      {isOnboardingOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 isolate overflow-y-auto">
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
            className="relative w-full max-w-2xl bg-card border border-border/80 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] rounded-[3rem] overflow-hidden my-8"
          >
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-40 transition-colors duration-700", step.color)} />

            <div className="relative z-10 p-6 sm:p-10">
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted/50 text-muted-foreground transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center space-y-6">
                <motion.div
                  key={`icon-${currentStep}`}
                  initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
                  animate={{ scale: 1.2, opacity: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200 }}
                  className="w-20 h-20 rounded-[2rem] bg-card border border-border flex items-center justify-center shadow-2xl mb-2"
                >
                  {step.icon}
                </motion.div>

                <div className="space-y-2">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground opacity-60">
                    Step {currentStep + 1} / {TUTORIAL_STEPS.length}
                  </h3>
                  <h2 className="text-2xl sm:text-4xl font-black text-foreground tracking-tighter leading-none mb-1">
                    {step.title}
                  </h2>
                  <p className="text-sm font-black uppercase tracking-widest text-primary/80">{step.subtitle}</p>
                </div>

                {!isPersonaStep ? (
                  <p className="text-sm sm:text-lg text-muted-foreground font-medium leading-relaxed max-w-md">
                    {step.description}
                  </p>
                ) : (
                  <form onSubmit={handleSubmit} className="w-full text-left space-y-4 max-w-lg mt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name / Nickname */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                          Name / Nickname
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Your preferred name"
                          className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                        />
                      </div>

                      {/* Age */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                          Age
                        </label>
                        <input
                          type="text"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                          placeholder="e.g. 28"
                          className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                        />
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                          Gender
                        </label>
                        <input
                          type="text"
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          placeholder="e.g. Female, Male, Non-binary"
                          className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                        />
                      </div>

                      {/* City */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                          City / Location
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="e.g. San Francisco, CA"
                          className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                        />
                      </div>

                      {/* Work Designation */}
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                          Work Designation / Professional Role
                        </label>
                        <input
                          type="text"
                          value={formData.workDesignation}
                          onChange={(e) => setFormData({ ...formData, workDesignation: e.target.value })}
                          placeholder="e.g. Senior Software Engineer, Design Student"
                          className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                        />
                      </div>

                      {/* Interests */}
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                          Interests & Focus Areas
                        </label>
                        <textarea
                          rows={3}
                          value={formData.interests}
                          onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                          placeholder="e.g. Next.js, marathon training, photography, time management, slow productivity"
                          className="w-full px-4 py-2.5 bg-background/50 border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all resize-none"
                        />
                      </div>
                    </div>
                  </form>
                )}

                <div className="w-full flex items-center justify-center gap-2 pt-2">
                  {TUTORIAL_STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-500",
                        i === currentStep ? "w-8 bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" : "w-1.5 bg-border/50"
                      )}
                    />
                  ))}
                </div>

                <div className="w-full flex gap-4 pt-6">
                  {currentStep > 0 && (
                    <button
                      onClick={prevStep}
                      disabled={isProcessingAI}
                      className="flex-1 py-4 bg-muted/40 hover:bg-muted text-muted-foreground rounded-[2rem] font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-2 border border-border/50 shadow-sm disabled:opacity-50"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                  )}
                  <button
                    onClick={nextStep}
                    disabled={isProcessingAI}
                    className={cn(
                      "flex-1 py-4 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-2 shadow-2xl active:scale-[0.98] outline-none disabled:opacity-50",
                      step.accent,
                      "hover:opacity-90"
                    )}
                  >
                    {isProcessingAI ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating Track...
                      </span>
                    ) : currentStep === TUTORIAL_STEPS.length - 1 ? (
                      <>Get Started <CheckCircle2 className="w-4 h-4" /></>
                    ) : (
                      <>Continue <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>

                <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest pt-2">
                  Your data is NOT shared with anyone but you.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
