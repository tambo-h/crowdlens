import React from "react";

export interface Snippet {
    id: string;
    title: string;
    code: string;
    language: string;
    tags: string[];
    savedAt: string;
}

export interface CodeSnippetsContextValue {
    snippets: Snippet[];
    isLoading: boolean;
    saveSnippet: (title: string, code: string, language: string, tags: string[]) => Promise<void>;
    searchSnippets: (query: string) => void;
}

const CodeSnippetsContext = React.createContext<CodeSnippetsContextValue | null>(null);

export function useCodeSnippetsContext() {
    const context = React.useContext(CodeSnippetsContext);
    if (!context) {
        throw new Error("CodeSnippets parts must be used within CodeSnippets.Root");
    }
    return context;
}

export { CodeSnippetsContext };
