import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { CodeSnippetsContext, Snippet } from "./code-snippets-context";
import { saveSnippet as saveSnippetService, getSnippets } from "@/services/productivity-service";
import { useProductivity } from "@/context/productivity-context";

export interface CodeSnippetsRootProps {
    children: React.ReactNode;
    asChild?: boolean;
    initialSnippets?: Snippet[];
    className?: string;
}

export const CodeSnippetsRoot = React.forwardRef<HTMLDivElement, CodeSnippetsRootProps>(
    ({ children, asChild, initialSnippets = [], ...props }, ref) => {
        const { creativeRefreshTrigger, userId } = useProductivity();
        const [snippets, setSnippets] = React.useState<Snippet[]>(initialSnippets);
        const [isLoading, setIsLoading] = React.useState(false);

        // Initial fetch
        React.useEffect(() => {
            const fetchData = async () => {
                if (!userId) return;
                setIsLoading(true);
                try {
                    const data = await getSnippets(userId);
                    setSnippets(data);
                } catch (error) {
                    console.error("Failed to fetch snippets:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }, [creativeRefreshTrigger, userId]);

        const saveSnippet = async (title: string, code: string, language: string, tags: string[]) => {
            if (!userId) return;
            setIsLoading(true);
            try {
                const result = await saveSnippetService(userId, { title, code, language, tags });
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

        const deleteSnippet = async (id: string) => {
            if (!userId || !confirm("Delete this snippet?")) return;
            setIsLoading(true);
            try {
                const { deleteSnippet: deleteService } = await import("@/services/productivity-service");
                await deleteService(userId, id);
                setSnippets((prev) => prev.filter(s => s.id !== id));
            } catch (error) {
                console.error("Failed to delete snippet:", error);
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
            <CodeSnippetsContext.Provider value={{ snippets, isLoading, saveSnippet, deleteSnippet, searchSnippets }}>
                <Comp ref={ref} {...props}>
                    {children}
                </Comp>
            </CodeSnippetsContext.Provider>
        );
    }
);

CodeSnippetsRoot.displayName = "CodeSnippets.Root";
