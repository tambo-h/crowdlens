/**
 * @file link-card.tsx
 * @description Tambo generative component for displaying saved links
 */

"use client";

import { z } from "zod";

export const linkCardSchema = z.object({
  links: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      url: z.string(),
      tags: z.array(z.string()),
      notes: z.string().optional(),
      savedAt: z.string(),
    })
  ).describe("List of saved links"),
  viewMode: z.enum(["cards", "list"]).default("cards").describe("Display mode"),
});

type LinkCardProps = z.infer<typeof linkCardSchema>;

export function LinkCard({ links = [], viewMode = "cards" }: any) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Just now";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch (e) {
      return "Recently";
    }
  };

  // If links is missing but single link properties are present, wrap in array
  let displayLinks = Array.isArray(links) ? links : [];

  // Handle case where Tambo might pass a single link object as top-level props
  if (displayLinks.length === 0 && (arguments[0]?.url || arguments[0]?.title)) {
    displayLinks = [arguments[0]];
  }

  if (viewMode === "list") {
    return (
      <div className="bg-card rounded-xl p-6 border border-border max-w-4xl">
        <h2 className="text-2xl font-bold text-foreground mb-4">📚 Saved Links</h2>
        <div className="space-y-2">
          {displayLinks.map((link, idx) => (
            <a
              key={link.id || idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-lg bg-muted/30 hover:bg-muted/50 border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-foreground mb-1">{link.title}</h3>
                  {link.notes && (
                    <p className="text-sm text-muted-foreground mb-2">{link.notes}</p>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {link.tags?.map((tag: string, tidx: number) => (
                      <span
                        key={tidx}
                        className="px-2 py-0.5 text-xs rounded-md bg-primary/20 text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground ml-4">
                  {formatDate(link.savedAt)}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border max-w-6xl">
      <h2 className="text-2xl font-bold text-foreground mb-6">📚 Saved Links</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayLinks.map((link, idx) => (
          <a
            key={link.id || idx}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-5 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-border hover:border-primary/50 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-foreground flex-1 line-clamp-2">
                {link.title}
              </h3>
              <span className="text-xl ml-2">🔗</span>
            </div>

            {link.notes && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {link.notes}
              </p>
            )}

            <div className="flex gap-2 flex-wrap mb-3">
              {link.tags?.slice(0, 3).map((tag: string, tidx: number) => (
                <span
                  key={tidx}
                  className="px-2 py-1 text-xs rounded-md bg-primary/20 text-primary font-medium"
                >
                  {tag}
                </span>
              ))}
              {(link.tags?.length || 0) > 3 && (
                <span className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground">
                  +{link.tags.length - 3}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatDate(link.savedAt)}</span>
              <span className="hover:text-primary transition-colors">→</span>
            </div>
          </a>
        ))}
      </div>

      {displayLinks.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl block mb-4">🔗</span>
          <p className="text-muted-foreground">No links saved yet</p>
          <p className="text-sm text-muted-foreground mt-1">Start saving your favorite resources!</p>
        </div>
      )}
    </div>
  );
}
