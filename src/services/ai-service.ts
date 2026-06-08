/**
 * @file ai-service.ts
 * @description Service to interact with OpenRouter for personalized content generation
 */

const getApiKey = () => process.env.OPENROUTER_API_KEY || "";
const MODEL = process.env.OPENROUTER_MODEL || "openrouter/free";

export interface GeneratedData {
    habits: Array<{ name: string, category: string, deadline: string }>;
    links: Array<{ title: string, url: string, tags: string[] }>;
    rules: string[];
    trackDeadline: string;
}

export interface ChallengeExpansion {
    steps: { title: string, deadline: string }[];
    resources: { title: string, url: string, tags: string[] }[];
}

export async function generatePersonalizedData(skill: string, experienceLevel?: string, projectType?: string, currentDate?: string, persona?: any): Promise<GeneratedData> {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is not configured. Please add it to your environment variables.");
    }

    const dateStr = currentDate || new Date().toISOString().split('T')[0];

    let personaContext = "";
    if (persona) {
        personaContext = `\n\n[User Profile Persona Context]\n`;
        if (persona.age) personaContext += `- Age: ${persona.age}\n`;
        if (persona.gender) personaContext += `- Gender: ${persona.gender}\n`;
        if (persona.city) personaContext += `- City: ${persona.city}\n`;
        if (persona.workDesignation) personaContext += `- Work Designation: ${persona.workDesignation}\n`;
        if (persona.interests) personaContext += `- Interests: ${persona.interests}\n`;
        personaContext += `Please refine and tailor all challenges, resources, and rules to be highly aligned with this user's profile and interests.`;
    }

    const prompt = `You are an expert mentor and project planner. Today's date is ${dateStr}.

For a ${experienceLevel || "standard"} ${skill}${projectType ? ` building a ${projectType}` : ""}, provide:
1. 10 specific, hands-on "Skill Challenges" tailored to this level and project type, each with a realistic deadline date (YYYY-MM-DD format) spread across a reasonable learning timeline starting from today.
2. 5 high-quality learning resources (links).
3. 3 "Slow Productivity" rules for this specific context.
4. An overall "trackDeadline" (YYYY-MM-DD) for when the entire skill track should be completed.

${personaContext}

Respond ONLY with a JSON object in this format:
{
  "habits": [ { "name": "Challenge Title", "category": "Core", "deadline": "YYYY-MM-DD" }, ... ],
  "links": [ { "title": "Resource Title", "url": "https://...", "tags": ["learning"] }, ... ],
  "rules": [ "Rule 1", ... ],
  "trackDeadline": "YYYY-MM-DD"
}

Make the challenges specific and practical. Space deadlines realistically (don't cram everything into one week). Earlier challenges should have earlier deadlines.`;

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
                messages: [
                    { role: "system", content: "You are a Productivity OS mentor. You ONLY help with professional work, skill tracks, and workspace setups. IMPORTANT: When a user asks to set up a workspace for ANY goal or skill, call the setupPersonalizedWorkspace tool IMMEDIATELY. Do NOT ask follow-up questions. Infer the skill and experience level from their message (default: beginner). The app saves user time — act fast, don't interrogate." },
                    { role: "user", content: prompt }
                ],
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

export async function generateChallengeDetails(challengeTitle: string, role: string, currentDate?: string, challengeDeadline?: string, persona?: any): Promise<ChallengeExpansion> {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is not configured for challenge details.");
    }

    const dateStr = currentDate || new Date().toISOString().split('T')[0];
    const deadlineContext = challengeDeadline
        ? `The challenge deadline is ${challengeDeadline}. Space the step deadlines between today (${dateStr}) and the challenge deadline.`
        : `Today is ${dateStr}. Assign realistic deadlines to each step, spread across the next 1-2 weeks.`;

    let personaContext = "";
    if (persona) {
        personaContext = `\n\n[User Profile Persona Context]\n`;
        if (persona.age) personaContext += `- Age: ${persona.age}\n`;
        if (persona.gender) personaContext += `- Gender: ${persona.gender}\n`;
        if (persona.city) personaContext += `- City: ${persona.city}\n`;
        if (persona.workDesignation) personaContext += `- Work Designation: ${persona.workDesignation}\n`;
        if (persona.interests) personaContext += `- Interests: ${persona.interests}\n`;
        personaContext += `Please refine and tailor all generated steps and resources to be highly aligned with this user's profile and interests.`;
    }

    const prompt = `For the challenge "${challengeTitle}" in the context of being a ${role}, provide:
1. 3-5 clear, actionable steps to complete it, each with a deadline date (YYYY-MM-DD format).
2. 2-3 high-quality direct resource links (URL and title).

${deadlineContext}

${personaContext}

Respond ONLY with a JSON object:
{
  "steps": [ { "title": "Step 1 description", "deadline": "YYYY-MM-DD" }, ... ],
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
                messages: [
                    { role: "system", content: "You are a Growth Mentor. Provide only the requested JSON for this challenge. Refuse unrelated requests." },
                    { role: "user", content: prompt }
                ],
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

export async function generateTrackCoachReview(
    role: string,
    trackDeadline: string | undefined,
    challenges: Array<{
        title: string;
        completed: boolean;
        steps: Array<{ title: string; completed: boolean; deadline?: string }>;
    }>,
    currentDate: string,
    persona?: any
): Promise<string> {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is not configured. Please add it to your environment variables.");
    }

    let personaContext = "";
    if (persona) {
        personaContext = `\n\n[User Profile Persona Context]\n`;
        if (persona.age) personaContext += `- Age: ${persona.age}\n`;
        if (persona.gender) personaContext += `- Gender: ${persona.gender}\n`;
        if (persona.city) personaContext += `- City: ${persona.city}\n`;
        if (persona.workDesignation) personaContext += `- Work Designation: ${persona.workDesignation}\n`;
        if (persona.interests) personaContext += `- Interests: ${persona.interests}\n`;
        personaContext += `Use this user profile to customize the coaching advice, metaphors, and tone.`;
    }

    const prompt = `You are a high-performance productivity coach. Today's date is ${currentDate}.
Analyze the user's progress for the "${role}" Skill Track and provide structured, highly personalized feedback.

Track Target Completion Date: ${trackDeadline || "None set"}
Challenges & Sub-tasks data:
${JSON.stringify(challenges, null, 2)}
${personaContext}

Your feedback should include:
1. **Summary & Stats**: Start with a personalized summary statement referencing specific counts of finished tasks vs total tasks (e.g. "Good job! I see you have completed 10 out of 20 sub-tasks..."). Make it sound warm and personalized.
2. **Progress Analysis & Coaching Insights**:
   - If they are completing tasks on time: Provide positive reinforcement, point out what they are doing right, and encourage them to keep the momentum.
   - If they are lagging or have overdue tasks (sub-tasks with deadlines before today ${currentDate} that are not completed): Give constructive insights into *why* they might be struggling with these particular tasks, and suggest adjustments (e.g., break them down further, slow productivity principles).
3. **Next Actions**: Provide 3 clear, actionable next steps they should take today or this week to stay on track.
4. **General Advice**: An encouraging closing tip tailored to their persona interests and work role.

Format your response in clean, premium Markdown (using emojis, bold text, and bullet points). Keep the tone encouraging, empathetic, yet highly professional.`;

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
                messages: [
                    { role: "system", content: "You are a senior executive performance coach. You provide motivating, hyper-personalized progress assessments." },
                    { role: "user", content: prompt }
                ]
            }),
        });

        const data = await response.json();
        if (data.error || !data.choices?.[0]?.message?.content) {
            console.error("[AI-Service] Coach review generation failure:", data.error || "No content returned");
            throw new Error("Failed to generate coach feedback.");
        }

        return data.choices[0].message.content;
    } catch (error) {
        console.error("[AI-Service] Coach review failure:", error);
        throw error;
    }
}
