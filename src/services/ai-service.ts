/**
 * @file ai-service.ts
 * @description Service to interact with OpenRouter for personalized content generation
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "openrouter/free";

export interface GeneratedData {
    habits: Array<{ name: string, category: string }>; // Keeping key 'habits' for compatibility with setup draft but changing intent
    links: Array<{ title: string, url: string, tags: string[] }>;
    rules: string[];
}

export interface ChallengeExpansion {
    steps: { title: string }[];
    resources: { title: string, url: string, tags: string[] }[];
}

export async function generatePersonalizedData(skill: string, experienceLevel?: string, projectType?: string): Promise<GeneratedData> {
    if (!OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is not configured");
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
        const jsonStr = content.includes("```")
            ? content.split("```")[1].replace(/^(json|javascript|js)/, "").split("```")[0].trim()
            : content;

        const parsed = JSON.parse(jsonStr) as GeneratedData;
        return parsed;
    } catch (error) {
        console.error("[AI-Service] Critical Failure:", error);
        throw error;
    }
}

export async function generateChallengeDetails(challengeTitle: string, role: string): Promise<ChallengeExpansion> {
    if (!OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is not configured");
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
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }
            }),
        });

        const data = await response.json();
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
