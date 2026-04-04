



demo link 
https://youtu.be/_pYruGua9U4


Production URL: https://taskstack-psi.vercel.app


github link : https://github.com/tambo-h/crowdlens




Architecture


Framework: Next.js 15 (App Router) for a robust, React-based frontend.
Styling: Vanilla Tailwind CSS with a premium, dark-mode-first aesthetic and Framer Motion for micro-animations.
Database/Persistence: Upstash Redis handles all real-time state, including user challenges, energy data, and temporary AI drafts.

AI Engine: Integrated via OpenRouter, utilizing advanced LLMs to generate personalized career roadmaps and "Slow Productivity" strategies.

Authentication: A custom, lightweight 6-digit PIN system that provides session persistence without the friction of social logins.



Tambo Usage: 
Generative UI: Tambo renders specialized React components directly in the chat (like the 
WorkspacePreview
 or SkillTracker), allowing users to visualize their productivity tracks before committing to them.
Interactive Tools: The bot has direct access to the application’s state through a rich set of Tambo Tools (e.g., 
setupPersonalizedWorkspace, logEnergyLevel). This allows the AI to proactively update your dashboard based on conversation.
Contextual Intelligence: Tambo uses the user's current view and role to tailor its suggestions, providing "Slow Productivity" rules specific to your profession.



Key Features : 
Role-Based Mastery Tracks: AI generates 10+ hands-on challenges and curated resources for roles like "Next.js Developer" or "Business Analyst," tailored to your experience level and project type.
Energy Tracker: A visual mapper that syncs with your dashboard header, helping you plan high-focus work during your peak energy hours.
Proactive Onboarding: A chat-driven setup flow that intelligently builds your workspace based on your professional goals.
Slow Productivity OS: Includes built-in tools for Distraction Journaling, Code Snippets, Daily Standups, and Weekly Reviews.
