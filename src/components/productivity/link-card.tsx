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

import { useProductivity } from "@/context/productivity-context";
import { useEffect, useState } from "react";
import { getSavedLinks, deleteLink as deleteLinkService, saveLink as saveLinkService } from "@/services/productivity-service";
import { Trash2, ExternalLink, Plus, X } from "lucide-react";

type LinkCardProps = z.infer<typeof linkCardSchema>;

function LinkPreview({ url }: { url: string }) {
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!url || url === "undefined") return;
    fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
      .then(res => res.json())
      .then(setPreview)
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [url]);

  if (loading) return <div className="h-24 bg-muted animate-pulse rounded-t-lg mb-3" />;
  if (!preview || (!preview.image && !preview.description)) return null;

  return (
    <div className="mb-3 rounded-lg overflow-hidden border border-border bg-background/50">
      {preview.image && (
        <div className="h-24 overflow-hidden relative">
          <img src={preview.image} alt="" className="w-full h-full object-cover opacity-80 group-hover/link:scale-105 transition-transform duration-500" />
        </div>
      )}
      {preview.description && (
        <div className="p-2">
          <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
            {preview.description}
          </p>
        </div>
      )}
    </div>
  );
}

export function LinkCard({ links: initialLinks = [], viewMode = "cards" }: any) {
  const { userId, creativeRefreshTrigger, triggerCreativeRefresh } = useProductivity();
  const [links, setLinks] = useState<any[]>(initialLinks);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    getSavedLinks(userId).then(setLinks).finally(() => setIsLoading(false));
  }, [userId, creativeRefreshTrigger]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId || !confirm("Delete this link?")) return;
    await deleteLinkService(userId, id);
    triggerCreativeRefresh();
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newUrl) return;
    await saveLinkService(userId, { url: newUrl, title: newTitle, tags: [] });
    setNewUrl("");
    setNewTitle("");
    setIsAdding(false);
    triggerCreativeRefresh();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Just now";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch (e) {
      return "Recently";
    }
  };

  const getSafeHostname = (urlStr: string) => {
    try {
      if (!urlStr) return "link";
      // Handle cases where URL might not have protocol
      const normalizedUrl = urlStr.includes("://") ? urlStr : `https://${urlStr}`;
      return new URL(normalizedUrl).hostname;
    } catch (e) {
      return "resource";
    }
  };

  const linksToDisplay = links.length > 0 ? links : (Array.isArray(initialLinks) ? initialLinks : []);

  if (isLoading && links.length === 0) {
    return (
      <div className="bg-card rounded-xl p-12 border border-border text-center flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border max-w-6xl w-full">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-foreground">📚 Knowledge Base</h2>
           <div className="text-xs text-muted-foreground">{linksToDisplay.length} resources saved</div>
        </div>
        <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
        >
            {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isAdding ? "Cancel" : "Add Link"}
        </button>
      </div>

      {isAdding && (
          <form onSubmit={handleAddLink} className="mb-6 p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row gap-4">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Title (optional)"
                className="flex-1 px-4 py-2 bg-background border border-border rounded-lg outline-none focus:border-primary text-sm"
              />
              <input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="URL (https://...)"
                className="flex-1 px-4 py-2 bg-background border border-border rounded-lg outline-none focus:border-primary text-sm"
                required
              />
              <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 font-medium">
                  Save
              </button>
          </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {linksToDisplay.map((link, idx) => (
          <div key={link.id || idx} className="group/link relative">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-5 rounded-xl bg-muted/20 border border-border hover:border-primary/50 hover:bg-muted/30 transition-all h-full"
            >
              <LinkPreview url={link.url} />

              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-foreground flex-1 line-clamp-2 leading-tight group-hover/link:text-primary transition-colors">
                  {link.title || getSafeHostname(link.url)}
                </h3>
              </div>

              {link.notes && (
                <p className="text-xs text-muted-foreground mb-4 line-clamp-2 italic">
                  "{link.notes}"
                </p>
              )}

              <div className="flex gap-2 flex-wrap mb-4">
                {link.tags?.slice(0, 3).map((tag: string, tidx: number) => (
                  <span
                    key={tidx}
                    className="px-2 py-0.5 text-[10px] rounded-md bg-primary/10 text-primary border border-primary/20 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-auto">
                <span className="flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  {getSafeHostname(link.url)}
                </span>
                <span>{formatDate(link.savedAt)}</span>
              </div>
            </a>

            {/* Actions for manual management (Bug 1) */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/link:opacity-100 transition-opacity">
              <button
                onClick={(e) => handleDelete(e, link.id)}
                className="p-1.5 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {linksToDisplay.length === 0 && (
          <div className="col-span-full text-center py-20 bg-muted/10 rounded-xl border border-dashed border-border">
            <span className="text-6xl block mb-4 opacity-50">📚</span>
            <p className="text-muted-foreground font-medium">Your knowledge base is empty.</p>
            <p className="text-sm text-muted-foreground mt-1">AI can suggest resources, or you can save them manually.</p>
          </div>
        )}
      </div>
    </div>
  );
}
