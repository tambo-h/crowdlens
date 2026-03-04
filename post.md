# Building TaskStack: A Slow Productivity OS

Let me tell you a story about how I built [TaskStack](https://taskstack-psi.vercel.app/). If you have ever felt like you are drowning in a sea of to-do lists, open tabs, and forgotten habits, you are not alone. I decided to build TaskStack, a "Slow Productivity OS", to fix my own chaotic workflow. 

And the best part? I didn't write every single line of code by myself while crying into a keyboard. I used Google Gemini as my incredibly patient AI pair programmer to build this entire project from a blank folder to a live URL on Vercel.

Here is a detailed look at how it all came together, what features exist, and how Gemini made it possible.

## What is TaskStack?

TaskStack is not just another aggressively demanding to-do app that makes you feel bad for missing a deadline. It is a Slow Productivity OS. It focuses on skill mastery, energy mapping, and deep work rather than just checking off meaningless boxes. 

![TaskStack Dashboard View](./screenshots/dashboard.png)

### The Core Features

I wanted TaskStack to have everything you need to actually do deep work, without the toxic hustle culture. Here is what we packed into it:

- **The Dashboard & Habit Tracker**: Your daily command center. A place to track what actually matters.
- **Pomodoro Timer**: Because sometimes you need a ticking clock to stop you from scrolling social media.
- **Link Cards**: A sane way to organize all those articles you swear you will read "later".
- **The Creative Toolkit**: This is where the magic happens. It includes a Distraction Journal to dump random thoughts, a Weekly Review to reflect on your progress, a Standup Log, and a Code Snippets manager.
- **Energy Mapper**: Because you are a human, not a machine. This feature syncs your energy levels so you know when you are in your "Peak Performance" hours and when you should probably just take a nap.
- **Slow Productivity Rules Engine**: A real-time tracker for practicing productivity philosophies. 
- **AI-Driven Roadmaps & Mastery Tracks**: We moved away from simple habits to actual skill mastery. The app groups challenges by your professional role (like Angular Developer or Business Analyst).
- **Proactive AI Workspace Previews**: A generative UI card that shows you a draft of AI-generated workspaces before committing to them. It politely asks for consent before changing your workspace.
- **PIN-Based Authentication**: A lightweight 6-digit PIN system because remembering complex passwords is the opposite of slow productivity. Multi-user support on a shared instance is built right in.
- **Multi-Role Grouping**: Work on multiple career roadmaps at the same time without losing your mind.

## The Development Journey with Google Gemini

Building a full-stack application from scratch sounds intimidating. But with Google Gemini, it felt like having a senior engineer sitting next to me, minus the sighs of disappointment. 

### 1. The Foundation
We started with a blank slate. I asked Gemini to help scaffold a Next.js application and set up the core design system. Within minutes, we had the basic structure. Gemini guided me through creating the dashboard and integrating Upstash Redis. Why Redis? Because I wanted user data to actually survive a page refresh. Gemini wrote the server-side directives and environment variable guards to make sure the database access was secure.

### 2. Getting Creative with UI
Next, we tackled the Creative Toolkit. I told Gemini I wanted a Distraction Journal and an Energy Mapper. Gemini provided the React components, styling with Tailwind, and logic to sync the Energy Mapper with the Dashboard header. When we hit a bug where the UI states were out of sync, Gemini patiently debugged the state management until the "Peak Performance" hours were always visible exactly where they needed to be.

![TaskStack Creative Toolkit and Energy Mapper](./screenshots/creative-toolkit.png)

### 3. The Pivot to Skill Mastery
Halfway through, I decided to pivot. Classic developer move. Instead of just tracking habits, I wanted AI-driven roadmaps. Gemini helped refactor the entire data model to support challenges grouped by roles. We built an AI service that could generate 10+ hands-on challenges tailored to specific roles, with dynamic resource curation based on experience level. 

Gemini even helped write the defensive code for the Workspace Preview components so that unexpected data would not crash the entire app. 

![TaskStack AI-Driven Roadmaps & Workspace Previews](./screenshots/ai-roadmaps.png)

### 4. Hardening and Deploying
Finally, the deployment boss fight. We implemented a lightweight PIN authentication system, fixing sessions and Redis drafts along the way. When it was time to go live, Gemini walked me through the environment variable requirements for Vercel. 

With a simple push to the main branch, Vercel took over, and TaskStack was live. No servers to provision, no complex CI/CD pipelines to construct by hand. Just pure, unadulterated deployment bliss.

## Conclusion

Building TaskStack was an incredible experience. By leveraging Google Gemini, I was able to accelerate development, learn new patterns, and build a feature-rich, beautiful application without losing my sanity. 

It went from a vague idea about "slow productivity" to a fully deployed Next.js application on Vercel. Check it out live here: [TaskStack](https://taskstack-psi.vercel.app/). Now, if you will excuse me, my Energy Mapper is telling me it is time for a break.
