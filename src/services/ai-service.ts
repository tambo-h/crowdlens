/**
 * @file ai-service.ts
 * @description Service to interact with OpenRouter for personalized content generation
 */

const getApiKey = () => process.env.OPENROUTER_API_KEY || "";
const MODEL = "openrouter/free";

export interface GeneratedData {
    habits: Array<{ name: string, category: string }>;
    links: Array<{ title: string, url: string, tags: string[] }>;
    rules: string[];
}

export interface ChallengeExpansion {
    steps: { title: string }[];
    resources: { title: string, url: string, tags: string[] }[];
}

export async function generatePersonalizedData(skill: string, experienceLevel?: string, projectType?: string): Promise<GeneratedData> {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is not configured. Please add it to your environment variables.");
    }

    const prompt = `You are an expert mentor. For a ${experienceLevel || "standard"} ${skill}${projectType ? ` building a ${projectType}` : ""}, provide:
1. 10 specific, hands-on "Skill Challenges" tailored to this level and project type.
2. 5 high-quality learning resources (links).
3. 3 "Slow Productivity" rules for this specific context.

Respond ONLY with a JSON object in this format:
{
  "habits": [ { "name": "Challenge Title", "category": "Core" }, ... ],
  "links": [...],
  "rules": [...]
}

Make the challenges specific and practical.`;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "https://taskstack.vercel.app",
                "X-Title": "TaskStack"
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
            throw new Error(`AI Generation failed: ${data.error.message || "Unknown error"}`);
        }

        if (!data.choices?.[0]?.message?.content) {
            console.error("[AI-Service] Invalid response structure:", data);
            throw new Error("AI Generation returned an invalid response structure.");
        }

        const content = data.choices[0].message.content;
        const jsonStr = content.includes("```")
            ? content.split("```")[1].replace(/^(json|javascript|js)/, "").split("```")[0].trim()
            : content;

        return JSON.parse(jsonStr) as GeneratedData;
    } catch (error) {
        console.error("[AI-Service] Critical Failure:", error);
        throw error;
    }
}

export async function generateChallengeDetails(challengeTitle: string, role: string): Promise<ChallengeExpansion> {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is not configured for challenge details.");
    }

    const prompt = `For the challenge "${challengeTitle}" in the context of being a ${role}, provide:
1. 3-5 clear, actionable steps to complete it.
2. 2-3 high-quality direct resource links (URL and title).

Respond ONLY with a JSON object:
{
  "steps": [ { "title": "Step 1 description" }, ... ],
  "resources": [ { "title": "Resource Title", "url": "https://...", "tags": ["learning"] }, ... ]
}`;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "https://taskstack.vercel.app",
                "X-Title": "TaskStack"
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }
            }),
        });

        const data = await response.json();

        if (data.error || !data.choices?.[0]?.message?.content) {
            console.error("[AI-Service] Details generation failure:", data.error || "No choices in response");
            throw new Error("Failed to generate challenge details from AI.");
        }

        const content = data.choices[0].message.content;
        const jsonStr = content.includes("```")
            ? content.split("```")[1].replace(/^(json|javascript|js)/, "").split("```")[0].trim()
            : content;

        return JSON.parse(jsonStr) as ChallengeExpansion;
    } catch (error) {
        console.error("[AI-Service] Expansion failure:", error);
        throw error;
    }
}
