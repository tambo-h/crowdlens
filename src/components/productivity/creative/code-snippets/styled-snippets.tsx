"use client";

import React from "react";
import { CodeSnippets, Snippet } from "./index";
import { z } from "zod";
import { Code, Copy, Search, Plus, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { useCodeSnippetsContext } from "./code-snippets-context";

export const codeSnippetsSchema = z.object({
    initialSnippets: z.array(z.any()).optional(),
    language: z.string().optional(),
});

type CodeSnippetsProps = z.infer<typeof codeSnippetsSchema>;

const SnippetInner = () => {
    const { snippets, saveSnippet, isLoading } = useCodeSnippetsContext();
    const [title, setTitle] = React.useState("");
    const [code, setCode] = React.useState("");
    const [language, setLanguage] = React.useState("javascript");
    const [tags, setTags] = React.useState("");
    const [isAdding, setIsAdding] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !code) return;
        saveSnippet(title, code, language, tags.split(",").map(t => t.trim()).filter(Boolean));
        setTitle("");
        setCode("");
        setTags("");
        setIsAdding(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Suggest toast if it exists, otherwise just console
        console.log("Copied to clipboard");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Code className="w-6 h-6 text-primary" />
                    Code Snippets
                </h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                >
                    {isAdding ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isAdding ? "Cancel" : "New Snippet"}
                </button>
            </div>

            {isAdding && (
                <div className="bg-card rounded-xl p-6 shadow-sm border border-border animate-in fade-in slide-in-from-top-2 duration-300">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-muted-foreground">Title</label>
                            <input
                                placeholder="e.g., Auth Middleware, Fetch Helper..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full h-10 px-3 rounded-md bg-background border border-input focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-muted-foreground">Language</label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full h-10 px-3 rounded-md bg-background border border-input focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                >
                                    <option value="javascript">JavaScript</option>
                                    <option value="typescript">TypeScript</option>
                                    <option value="python">Python</option>
                                    <option value="css">CSS</option>
                                    <option value="html">HTML</option>
                                    <option value="bash">Bash</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-muted-foreground">Tags (comma separated)</label>
                                <input
                                    placeholder="react, auth, utils..."
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    className="w-full h-10 px-3 rounded-md bg-background border border-input focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-muted-foreground">Code</label>
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full h-32 p-3 rounded-md bg-background border border-input font-mono text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                placeholder="Paste your code here..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !title || !code}
                            className="w-full h-10 px-4 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? "Saving..." : "Save Snippet"}
                        </button>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                <CodeSnippets.Items>
                    {({ items }: { items: Snippet[] }) => (
                        <div className="grid gap-4">
                            {items.length === 0 && !isAdding ? (
                                <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border-2 border-dashed border-muted/50">
                                    No snippets saved yet.
                                </div>
                            ) : (
                                items.map((item: Snippet) => (
                                    <div key={item.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden group hover:border-primary/30 transition-all">
                                        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/10">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-foreground">{item.title}</span>
                                                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                                    {item.language}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(item.code)}
                                                className="p-1.5 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/5 rounded-md"
                                                title="Copy code"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="p-4 bg-background/50 relative">
                                            <pre className="text-xs font-mono overflow-x-auto whitespace-pre text-muted-foreground pr-8">
                                                {item.code}
                                            </pre>
                                        </div>
                                        {item.tags.length > 0 && (
                                            <div className="px-4 py-2 border-t border-border flex items-center gap-2 flex-wrap">
                                                {item.tags.map((tag: string) => (
                                                    <span key={tag} className="text-[10px] flex items-center gap-1 text-muted-foreground">
                                                        <Tag className="w-3 h-3" />
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </CodeSnippets.Items>
            </div>
        </div>
    );
};

export const StyledCodeSnippets = ({ initialSnippets, language }: CodeSnippetsProps) => {
    return (
        <CodeSnippets.Root initialSnippets={initialSnippets} className="max-w-2xl mx-auto p-4">
            <SnippetInner />
        </CodeSnippets.Root>
    );
};
