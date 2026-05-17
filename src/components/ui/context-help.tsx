"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ContextHelpProps {
  title: string;
  description: string;
  className?: string;
}

export function ContextHelp({ title, description, className }: ContextHelpProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({ top: rect.top, left: rect.left + rect.width / 2 });
    }
    setIsOpen(!isOpen);
  };

  // Close on scroll or resize to keep position accurate
  useEffect(() => {
    if (!isOpen) return;
    const handleEvents = () => setIsOpen(false);
    window.addEventListener("scroll", handleEvents, true);
    window.addEventListener("resize", handleEvents);
    return () => {
      window.removeEventListener("scroll", handleEvents, true);
      window.removeEventListener("resize", handleEvents);
    };
  }, [isOpen]);

  const popover = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] isolate pointer-events-none">
          {/* Backdrop for click-away */}
          <div 
            className="fixed inset-0 pointer-events-auto" 
            onClick={() => setIsOpen(false)}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            style={{ 
              top: coords.top - 12, // Above the icon
              left: coords.left,
              transform: "translate(-85%, -100%)" // Shift left and up
            }}
            className="absolute w-64 p-5 rounded-3xl bg-card/95 backdrop-blur-xl border border-border/80 shadow-[0_20px_50px_rgba(0,0,0,0.2)] pointer-events-auto"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                <Info className="w-3 h-3" />
                Guide
              </span>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <h4 className="text-sm font-black text-foreground mb-1.5 leading-none">{title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              {description}
            </p>
            
            {/* Arrow Tip */}
            <div 
              className="absolute left-[85%] bottom-0 w-3 h-3 bg-card border-r border-b border-border/80 rotate-45 translate-y-1/2 -translate-x-1/2" 
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={cn("relative inline-block align-middle", className)}>
      <button
        ref={buttonRef}
        onClick={toggle}
        className={cn(
          "p-1.5 rounded-full transition-all text-muted-foreground/60 hover:text-primary group/help active:scale-95",
          isOpen ? "bg-primary/10 text-primary" : "hover:bg-primary/10"
        )}
        title="Quick Help"
      >
        <Info className="w-4 h-4" />
      </button>

      {mounted && createPortal(popover, document.body)}
    </div>
  );
}
