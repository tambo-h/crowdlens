import React from "react";
import { useCodeSnippetsContext, Snippet } from "./code-snippets-context";

export interface CodeSnippetsItemsProps {
    children: (props: { items: Snippet[] }) => React.ReactNode;
}

export const CodeSnippetsItems = ({ children }: CodeSnippetsItemsProps) => {
    const { snippets } = useCodeSnippetsContext();

    const items = React.useMemo(() => snippets, [snippets]);

    return <>{children({ items })}</>;
};

CodeSnippetsItems.displayName = "CodeSnippets.Items";
