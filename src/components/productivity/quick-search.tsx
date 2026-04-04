"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useProductivity } from "@/context/productivity-context";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, CheckSquare, Target, BookOpen, Clock, Command, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContextHelp } from "@/components/ui/context-help";

export function QuickSearch() {
  const { challenges, setActiveView, setExpandedId, setCollapsedRoles } = useProductivity();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Flatten searchable items
  const results = React.useMemo(() => {
    if (!query.trim()) return [];
    
    const q = query.toLowerCase();
    const items: any[] = [];

    challenges.forEach(challenge => {
      // Match Role
      if (challenge.role?.toLowerCase().includes(q)) {
        items.push({
          id: `role-${challenge.role}`,
          type: "role",
          title: challenge.role,
          category: "Skill Track",
          role: challenge.role,
          challengeId: challenge.id
        });
      }

      // Match Challenge
      if (challenge.title.toLowerCase().includes(q)) {
        items.push({
          id: challenge.id,
          type: "challenge",
          title: challenge.title,
          category: "Challenge Card",
          role: challenge.role,
          challengeId: challenge.id
        });
      }

      // Match Steps
      challenge.steps?.forEach(step => {
        if (step.title?.toLowerCase().includes(q)) {
          items.push({
            id: step.id,
            type: "step",
            title: step.title,
            category: "Action Step",
            parent: challenge.title,
            role: challenge.role,
            challengeId: challenge.id
          });
        }
      });
    });

    // Remove duplicates and limit results
    const uniqueIds = new Set();
    return items.filter(item => {
      if (uniqueIds.has(item.id)) return false;
      uniqueIds.add(item.id);
      return true;
    }).slice(0, 8);
  }, [challenges, query]);

  const handleSelect = (item: any) => {
    setIsOpen(false);
    setQuery("");
    
    // 1. Move to Skills view
    setActiveView("skills");
    
    // 2. Expand parent role if it's collapsed
    if (item.role) {
      setCollapsedRoles((prev: string[]) => prev.filter(r => r !== item.role));
    }
    
    // 3. Set expanded challenge
    setExpandedId(item.challengeId);
    
    // 4. Scroll to element
    // SkillTracker handles pixel-perfect scroll restoration via sessionStorage
    // But for a search hit, we want to SCROLL TO it after the expansion animation
    setTimeout(() => {
       const el = document.querySelector(`[data-task-id="${item.challengeId}"]`);
       if (el) {
         el.scrollIntoView({ behavior: "smooth", block: "center" });
         // Highlight effect
         el.classList.add("ring-4", "ring-primary", "ring-offset-4", "ring-offset-background");
         setTimeout(() => {
           el.classList.remove("ring-4", "ring-primary", "ring-offset-4", "ring-offset-background");
         }, 2000);
       }
    }, 500);
  };

  // Shortcut key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  return (
    <>
      <div 
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        className="flex items-center gap-2 px-3 py-1.5 h-10 w-full sm:w-64 lg:w-96 rounded-2xl bg-muted/40 border border-border/50 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all group relative overflow-hidden cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <Search className="w-4 h-4" />
        <span className="text-[11px] font-bold uppercase tracking-wider">Quick Search...</span>
        
        <ContextHelp 
          title="Search Anything" 
          description="A global search for your entire OS. Find any task, track, or link across all workspaces instantly."
        />

        <div className="hidden sm:flex items-center gap-1 ml-auto">
          <kbd className="px-1.5 py-0.5 rounded-md bg-background border border-border text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 group-hover:text-primary transition-colors">
            ⌘K
          </kbd>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-[2.5rem] overflow-hidden"
            >
              <div className="p-6 border-b border-border flex items-center gap-4">
                <Search className="w-6 h-6 text-primary" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Task, role, challenge, step..."
                  className="flex-1 bg-transparent border-none outline-none text-xl font-bold placeholder:text-muted-foreground"
                />
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-muted rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-3">
                {!query ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <Command className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="text-sm font-bold uppercase tracking-[0.2em] mb-2">Search across your tracks</p>
                    <p className="text-[10px] uppercase tracking-widest opacity-60">Type to find actions, roles, or steps</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <p className="text-sm font-bold">No results for "{query}"</p>
                    <p className="text-xs mt-2">Try a different keyword</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {results.map((item, idx) => (
                      <button
                        key={item.id}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        onClick={() => handleSelect(item)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-3xl transition-all text-left group",
                          selectedIndex === idx 
                            ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]" 
                            : "hover:bg-muted"
                        )}
                      >
                        <div className={cn(
                          "p-2.5 rounded-2xl transition-colors",
                          selectedIndex === idx ? "bg-white/20" : "bg-muted group-hover:bg-primary/5"
                        )}>
                          {item.type === "role" && <Target className="w-5 h-5" />}
                          {item.type === "challenge" && <CheckSquare className="w-5 h-5" />}
                          {item.type === "step" && <BookOpen className="w-5 h-5" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                              selectedIndex === idx ? "border-white/20 bg-white/10" : "border-border bg-muted/50"
                            )}>
                              {item.category}
                            </span>
                            {item.role && item.type !== 'role' && (
                              <span className="text-[9px] font-bold opacity-60 truncate">in {item.role}</span>
                            )}
                          </div>
                          <p className="text-lg font-bold truncate leading-none">{item.title}</p>
                          {item.parent && (
                            <p className="text-[10px] font-medium opacity-60 mt-1">Found in: {item.parent}</p>
                          )}
                        </div>

                        <div className={cn(
                          "opacity-0 transition-opacity",
                          selectedIndex === idx ? "opacity-100" : ""
                        )}>
                          <Search className="w-5 h-5" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded-md bg-muted border border-border text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">↑↓</kbd>
                    <span className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground/40">Navigate</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded-md bg-muted border border-border text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Enter</kbd>
                    <span className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground/40">Select</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded-md bg-muted border border-border text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Esc</kbd>
                  <span className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground/40">Close</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
