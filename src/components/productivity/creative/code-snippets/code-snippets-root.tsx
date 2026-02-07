import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { CodeSnippetsContext, Snippet } from "./code-snippets-context";
import { saveSnippet as saveSnippetService } from "@/services/productivity-service";

export interface CodeSnippetsRootProps {
    children: React.ReactNode;
    asChild?: boolean;
    initialSnippets?: Snippet[];
    className?: string;
}

export const CodeSnippetsRoot = React.forwardRef<HTMLDivElement, CodeSnippetsRootProps>(
    ({ children, asChild, initialSnippets = [], ...props }, ref) => {
        const [snippets, setSnippets] = React.useState<Snippet[]>(initialSnippets);
        const [isLoading, setIsLoading] = React.useState(false);

        // Sync with prop changes
        React.useEffect(() => {
            if (initialSnippets) {
                setSnippets(initialSnippets);
            }
        }, [initialSnippets]);

        const saveSnippet = async (title: string, code: string, language: string, tags: string[]) => {
            setIsLoading(true);
            try {
                const result = await saveSnippetService({ title, code, language, tags });
                const newSnippet: Snippet = {
                    id: result.id,
                    title,
                    code,
                    language,
                    tags,
                    savedAt: result.savedAt,
                };
                setSnippets((prev) => [newSnippet, ...prev]);
            } catch (error) {
                console.error("Failed to save snippet:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const searchSnippets = (query: string) => {
            // In a real app, this might trigger a service call
            console.log("Searching snippets for:", query);
        };

        const Comp = asChild ? Slot : "div";

        return (
            <CodeSnippetsContext.Provider value={{ snippets, isLoading, saveSnippet, searchSnippets }}>
                <Comp ref={ref} {...props}>
                    {children}
                </Comp>
            </CodeSnippetsContext.Provider>
        );
    }
);

CodeSnippetsRoot.displayName = "CodeSnippets.Root";
