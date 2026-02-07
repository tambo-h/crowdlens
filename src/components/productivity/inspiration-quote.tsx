/**
 * @file inspiration-quote.tsx
 * @description Tambo generative component for displaying inspirational quotes
 */

"use client";

import { z } from "zod";
import { useState, useEffect } from "react";

export const inspirationQuoteSchema = z.object({
  quote: z.string().default("Focus on being productive instead of busy.").describe("The inspirational quote text"),
  author: z.string().default("Tim Ferriss").describe("Quote author"),
  category: z.enum(["technology", "productivity", "motivation", "custom"]).default("productivity"),
  isFavorite: z.boolean().default(false).describe("Whether this quote is favorited"),
});

type InspirationQuoteProps = z.input<typeof inspirationQuoteSchema>;

export function InspirationQuote({
  quote = "Focus on being productive instead of busy.",
  author = "Tim Ferriss",
  category = "productivity",
  isFavorite = false,
}: InspirationQuoteProps) {
  const [favorite, setFavorite] = useState(isFavorite);

  // Sync with prop updates
  useEffect(() => {
    setFavorite(isFavorite);
  }, [isFavorite]);

  return (
    <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-8 shadow-lg border border-primary/20 max-w-2xl">
      {/* Category Badge */}
      <div className="flex justify-between items-start mb-4">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
          {category}
        </span>
        <button
          onClick={() => setFavorite(!favorite)}
          className="text-2xl transition-transform hover:scale-110"
        >
          {favorite ? "⭐" : "☆"}
        </button>
      </div>

      {/* Quote */}
      <div className="mb-6">
        <div className="relative">
          <span className="absolute -top-2 -left-2 text-6xl text-primary/20 font-serif">"</span>
          <p className="text-xl md:text-2xl text-foreground font-medium leading-relaxed pl-8">
            {quote}
          </p>
          <span className="absolute -bottom-6 right-0 text-6xl text-primary/20 font-serif">"</span>
        </div>
      </div>

      {/* Author */}
      <div className="flex items-center justify-end mt-8">
        <p className="text-sm text-muted-foreground">
          — <span className="font-semibold text-foreground">{author}</span>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6 pt-4 border-t border-primary/10">
        <button className="px-4 py-2 text-sm rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
          📋 Copy
        </button>
        <button className="px-4 py-2 text-sm rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors">
          🔄 New Quote
        </button>
        <button className="px-4 py-2 text-sm rounded-md bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors">
          ➕ Add Custom
        </button>
      </div>
    </div>
  );
}
