/**
 * @file inspiration-quote.tsx
 * @description Tambo generative component for displaying inspirational quotes
 */

"use client";

import { z } from "zod";
import { useState, useEffect } from "react";

export const inspirationQuoteSchema = z.object({
  text: z.string().default("Focus on being productive instead of busy.").describe("The inspirational quote text"),
  author: z.string().default("Tim Ferriss").describe("Quote author"),
  category: z.enum(["technology", "productivity", "motivation", "custom"]).default("productivity"),
  isFavorite: z.boolean().default(false).describe("Whether this quote is favorited"),
});

import { useProductivity } from "@/context/productivity-context";
import { getInspirationalQuote, saveQuote } from "@/services/productivity-service";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

type InspirationQuoteProps = z.input<typeof inspirationQuoteSchema>;

export function InspirationQuote({
  text: initialText = "Focus on being productive instead of busy.",
  author: initialAuthor = "Tim Ferriss",
  category: initialCategory = "productivity",
  isFavorite: initialFavorite = false,
}: InspirationQuoteProps) {
  const { creativeRefreshTrigger, triggerCreativeRefresh, userId } = useProductivity();
  const [favorite, setFavorite] = useState(initialFavorite);
  const [currentQuote, setCurrentQuote] = useState({ text: initialText, author: initialAuthor, category: initialCategory });
  const [isLoading, setIsLoading] = useState(false);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [customQuotes, setCustomQuotes] = useState<any[]>([]);
  const [newQuoteText, setNewQuoteText] = useState("");
  const [newAuthorText, setNewAuthorText] = useState("");

  const fetchNewQuote = async (categoryFilter?: string) => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const q = await getInspirationalQuote(userId, { category: categoryFilter });
      setCurrentQuote({ text: q.text, author: q.author, category: q.category });

      // Fetch custom quotes for management
      const customPath = await getInspirationalQuote(userId, { category: "custom" });
      if (Array.isArray(customPath)) setCustomQuotes(customPath);
      else if (customPath.text && customPath.category === "custom") setCustomQuotes([customPath]);
      else setCustomQuotes([]);
    } catch (error) {
      console.error("Failed to fetch quote:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuote = async (id: string) => {
    if (!userId || !confirm("Delete this quote?")) return;
    const { deleteQuote } = await import("@/services/productivity-service");
    await deleteQuote(userId, id);
    triggerCreativeRefresh();
  };

  useEffect(() => {
    fetchNewQuote();
  }, [creativeRefreshTrigger]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${currentQuote.text}" — ${currentQuote.author}`);
  };

  const handleSaveCustom = async () => {
    if (!newQuoteText || !newAuthorText || !userId) return;
    setIsLoading(true);
    try {
      await saveQuote(userId, { text: newQuoteText, author: newAuthorText, category: "custom" });
      setShowAddCustom(false);
      setNewQuoteText("");
      setNewAuthorText("");
      triggerCreativeRefresh();
    } catch (error) {
      console.error("Failed to save custom quote:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-8 shadow-lg border border-primary/20 max-w-2xl w-full">
      {/* Category Badge */}
      <div className="flex justify-between items-start mb-4">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider">
          {currentQuote.category}
        </span>
        <button
          onClick={() => setFavorite(!favorite)}
          className="text-2xl transition-transform hover:scale-110"
        >
          {favorite ? "⭐" : "☆"}
        </button>
      </div>

      {/* Quote */}
      <div className="mb-6 min-h-[120px] flex items-center">
        {isLoading ? (
          <div className="w-full flex justify-center py-4">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-primary/10 rounded w-3/4"></div>
                <div className="h-4 bg-primary/10 rounded"></div>
                <div className="h-4 bg-primary/10 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full">
            <span className="absolute -top-6 -left-4 text-6xl text-primary/20 font-serif">"</span>
            <p className="text-xl md:text-2xl text-foreground font-medium leading-relaxed pl-4 italic">
              {currentQuote.text}
            </p>
            <span className="absolute -bottom-10 right-0 text-6xl text-primary/20 font-serif">"</span>
          </div>
        )}
      </div>

      {/* Author */}
      <div className="flex items-center justify-end mt-8">
        <p className="text-sm text-muted-foreground italic">
          — <span className="font-semibold text-foreground not-italic">{currentQuote.author}</span>
        </p>
      </div>

      {/* Manage Custom Quotes */}
      <button
        onClick={() => setShowManage(!showManage)}
        className="mt-4 text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:text-primary/60 transition-colors"
      >
        {showManage ? "Close Management" : "Manage My Quotes"}
      </button>

      {showManage && (
        <div className="mt-4 space-y-2 border-t border-primary/10 pt-4 animate-in fade-in duration-500">
          {customQuotes.length === 0 ? (
            <p className="text-[10px] text-muted-foreground italic text-center py-2">No custom quotes yet.</p>
          ) : (
            customQuotes.map((q: any) => (
              <div key={q.id} className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/10 group">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-[10px] font-medium text-foreground truncate italic">"{q.text}"</p>
                  <p className="text-[8px] text-muted-foreground">— {q.author}</p>
                </div>
                <button
                  onClick={() => handleDeleteQuote(q.id)}
                  className="p-1 px-2 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 text-[8px] font-bold uppercase"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Custom Quote Form */}
      {showAddCustom && (
        <div className="mt-6 p-4 bg-background/50 rounded-lg border border-primary/10 space-y-4 animate-in fade-in slide-in-from-top-4">
          <textarea
            placeholder="Enter an inspirational quote..."
            value={newQuoteText}
            onChange={(e) => setNewQuoteText(e.target.value)}
            className="w-full p-2 bg-background border border-border rounded-md text-sm focus:ring-1 focus:ring-primary outline-none"
            rows={3}
          />
          <input
            placeholder="Author"
            value={newAuthorText}
            onChange={(e) => setNewAuthorText(e.target.value)}
            className="w-full p-2 bg-background border border-border rounded-md text-sm focus:ring-1 focus:ring-primary outline-none"
          />
          <button
            onClick={handleSaveCustom}
            disabled={isLoading || !newQuoteText || !newAuthorText}
            className="w-full py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-all"
          >
            {isLoading ? "Saving..." : "Save Quote"}
          </button>
        </div>
      )}
    </div>
  );
}
