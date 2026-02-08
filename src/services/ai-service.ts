/**
 * @file ai-service.ts
 * @description Service to interact with OpenRouter for personalized content generation
 */

import { Habit } from "./productivity-service";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "qwen/qwen3-coder-next";

export interface GeneratedData {
    habits: Array<Omit<Habit, "id" | "streak" | "completedToday">>;
    links: Array<{ title: string, url: string, tags: string[] }>;
    rules: string[];
}

export async function generatePersonalizedData(skill: string): Promise<GeneratedData> {
    if (!OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const prompt = `You are a productivity expert. For a ${skill}, provide:
1. Top 10 habits as an array of objects: { name: string, category: "Code" | "Learn" | "Health" | "Review" }.
2. 5 high-quality learning resources (links) as an array: { title: string, url: string, tags: string[] }.
3. 3 "Slow Productivity" rules (deep work rules) for this specific role as an array of strings.

Respond ONLY with a JSON object in this format:
{
  "habits": [...],
  "links": [...],
  "rules": [...]
}

Ensure habit names are concise and categories are exactly as specified.`;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }
            }),
        });

        const data = await response.json();
        if (data.error) {
            console.error("[AI-Service] OpenRouter Error:", data.error);
            throw new Error(`OpenRouter API error: ${data.error.message}`);
        }

        const content = data.choices[0].message.content;
        console.log("[AI-Service] Raw Response content length:", content.length);
        console.log("[AI-Service] Raw Response Preview:", content.substring(0, 200) + "...");

        // Some models might include markdown code blocks even with response_format
        const jsonStr = content.includes("```")
            ? content.split("```")[1].replace(/^(json|javascript|js)/, "").split("```")[0].trim()
            : content;

        console.log("[AI-Service] Attempting to parse JSON string of length:", jsonStr.length);
        const parsed = JSON.parse(jsonStr) as GeneratedData;
        console.log("[AI-Service] Success! Generated:", {
            habits: parsed.habits?.length,
            links: parsed.links?.length,
            rules: parsed.rules?.length
        });
        return parsed;
    } catch (error) {
        console.error("[AI-Service] Critical Failure:", error);
        throw error;
    }
}
