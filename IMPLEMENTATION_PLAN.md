# ProductivityFlow Implementation Plan

## Executive Summary
Build a developer-focused productivity app using Tambo AI for generative UI, Next.js 15, and Upstash Redis for data persistence. The app will feature a Pomodoro timer, habit tracker, link saver, inspiration quotes, and productivity rules based on Cal Newport's "Slow Productivity" philosophy.

---

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **AI Framework**: Tambo AI (@tambo-ai/react v0.74.1)
- **Database**: Upstash Redis
- **Styling**: Tailwind CSS v4 with "Calm Dev" theme
- **State Management**: React hooks + Zustand (for complex state)
- **Charts**: Recharts (already available)
- **Icons**: Lucide React (already installed)

### Key Design Principles
1. **AI-Driven UI**: Use Tambo's generative components for dynamic productivity insights
2. **Calm Aesthetics**: Soft blues, off-white backgrounds, smooth animations
3. **Modular Architecture**: Register all features as Tambo components and tools
4. **Redis-First**: All user data stored in Upstash Redis with proper key namespacing

---

## Phase 1: Foundation & Setup (MVP Core)

### 1.1 Environment & Redis Setup
**Files to Create/Modify:**
- Update `example.env.local` to include Upstash Redis credentials
- Create `src/lib/redis.ts` for Redis client configuration
- Create `src/lib/redis-keys.ts` for key naming conventions

**Environment Variables Needed:**
```bash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_TAMBO_API_KEY=
```

**Redis Key Structure:**
```
user:{userId}:preferences          # User settings (JSON)
user:{userId}:pomodoro:sessions    # Sorted set of pomodoro sessions
user:{userId}:pomodoro:stats       # Hash of daily/weekly stats
user:{userId}:habits               # Hash of habit definitions
user:{userId}:habits:log:{date}    # Set of completed habit IDs per day
user:{userId}:links                # Sorted set of saved links (by timestamp)
user:{userId}:links:tags           # Hash mapping tag -> link IDs
user:{userId}:quotes:favorites     # Set of favorite quote IDs
user:{userId}:journal:distractions # List of distraction logs
user:{userId}:snippets             # Hash of code snippets
user:{userId}:standup:log          # Sorted set of daily standup entries
user:{userId}:energy:log           # Sorted set of energy level entries
```

### 1.2 Theme Implementation
**Files to Create/Modify:**
- Update `src/app/globals.css` with Calm Dev color palette
- Create `src/lib/theme.ts` for theme constants

**Color Palette (CSS Variables):**
```css
--color-primary: #A2D2FF;
--color-primary-light: #BDE0FE;
--color-background: #FAF9F6;
--color-surface: #F5F7FA;
--color-accent: #95D5B2;
--color-text: #2D3436;
--color-text-secondary: #636E72;
```

---

## Phase 2: Core Components Development

### 2.1 Pomodoro Timer Component
**Component Name**: `PomodoroTimer`
**File**: `src/components/productivity/pomodoro-timer.tsx`

**Features:**
- Customizable work/break durations
- Visual circular progress indicator
- Session counter display
- Project tagging dropdown
- Sound notifications (optional)
- Auto-start next session toggle

**Zod Schema:**
```typescript
{
  defaultWorkDuration: number (default: 25)
  defaultBreakDuration: number (default: 5)
  longBreakDuration: number (default: 15)
  autoStartNext: boolean
  soundEnabled: boolean
}
```

**Redis Operations:**
- On session complete: Add to `user:{userId}:pomodoro:sessions` sorted set
- Update `user:{userId}:pomodoro:stats` hash (increment daily/weekly counters)
- Tag sessions with project name for analytics

**Tambo Registration:**
- Tool: `getPomodoroStats` - Fetch user's pomodoro statistics
- Tool: `startPomodoroSession` - Begin a new pomodoro session
- Component: Display current timer state and controls

### 2.2 Habit Tracker Component
**Component Name**: `HabitTracker`
**File**: `src/components/productivity/habit-tracker.tsx`

**Features:**
- Grid view (7-day or 30-day)
- Add/edit/delete habits
- Mark habits complete for today
- Streak calculation
- Category badges (Code, Learn, Health, Review)

**Zod Schema:**
```typescript
{
  viewMode: 'week' | 'month'
  showStreaks: boolean
  filterByCategory?: string
}
```

**Redis Operations:**
- Store habit definitions in `user:{userId}:habits` hash
- Log completions in `user:{userId}:habits:log:{YYYY-MM-DD}` sets
- Calculate streaks by querying date range

**Tambo Registration:**
- Tool: `getHabits` - Fetch all user habits with streak data
- Tool: `toggleHabit` - Mark habit as complete/incomplete for a date
- Tool: `createHabit` - Add new habit
- Component: Display habit grid with completion status

### 2.3 Link Saver Component
**Component Name**: `LinkSaver`
**File**: `src/components/productivity/link-saver.tsx`

**Features:**
- Add link with title, URL, tags, notes
- Tag-based filtering
- Search by title/tags
- Archive/delete links
- Export as JSON/Markdown
- Card/list view toggle

**Zod Schema:**
```typescript
{
  viewMode: 'cards' | 'list'
  filterTags?: string[]
  searchQuery?: string
  sortBy: 'recent' | 'title' | 'tags'
}
```

**Redis Operations:**
- Store links in `user:{userId}:links` sorted set (score = timestamp)
- Index tags in `user:{userId}:links:tags` hash
- Search by querying sorted set and filtering

**Tambo Registration:**
- Tool: `saveLink` - Add new link to collection
- Tool: `searchLinks` - Search links by query and filters
- Tool: `exportLinks` - Generate JSON/Markdown export
- Component: Display filtered link collection

---

## Phase 3: Content & Inspiration Features

### 3.1 Inspiration Quotes Component
**Component Name**: `InspirationQuote`
**File**: `src/components/productivity/inspiration-quote.tsx`

**Features:**
- Display random quote from curated collection
- Fetch from API: https://api.quotable.io/random?tags=technology
- Favorite quotes
- Add custom quotes
- Daily featured quote

**Zod Schema:**
```typescript
{
  showFavorites: boolean
  category?: 'technology' | 'productivity' | 'custom'
}
```

**Redis Operations:**
- Cache fetched quotes in `user:{userId}:quotes:cache` (24h TTL)
- Store favorites in `user:{userId}:quotes:favorites` set
- Store custom quotes in `user:{userId}:quotes:custom` list

**Tambo Registration:**
- Tool: `getRandomQuote` - Fetch fresh quote from API
- Tool: `getFavoriteQuotes` - Get user's saved quotes
- Component: Display quote card with favorite button

### 3.2 Productivity Rules Guide
**Component Name**: `ProductivityRules`
**File**: `src/components/productivity/rules-guide.tsx`

**Features:**
- Display Cal Newport's 3 principles as cards
- Each card: principle, tip, example
- Progress checklist for adopting principles
- Mark principles as "practiced"

**Zod Schema:**
```typescript
{
  showProgress: boolean
  expandedPrinciple?: number
}
```

**Content Structure:**
```typescript
const rules = [
  {
    id: 1,
    title: "Do Fewer Things",
    explanation: "Limit active projects to 2-3 at most...",
    tips: ["Use a project queue", "Say no strategically"],
    example: "Work on one feature branch at a time..."
  },
  // ... 2 more principles
]
```

**Redis Operations:**
- Store practiced principles in `user:{userId}:rules:practiced` set
- Track adoption progress in `user:{userId}:rules:progress` hash

**Tambo Registration:**
- Tool: `getRulesProgress` - Get user's rule adoption status
- Tool: `markRulePracticed` - Update practice checklist
- Component: Display rule cards with progress indicators

---

## Phase 4: Creative Tools (Enhancements)

### 4.1 Distraction Journal
**Component Name**: `DistractionJournal`
**File**: `src/components/productivity/distraction-journal.tsx`

**Features:**
- Quick log of interruptions during work
- Timestamp, description, duration
- Analytics: most common distractions
- Weekly summary chart

**Zod Schema:**
```typescript
{
  showAnalytics: boolean
  dateRange: { start: string, end: string }
}
```

**Redis Operations:**
- Store in `user:{userId}:journal:distractions` list
- Query by date range for analytics

**Tambo Registration:**
- Tool: `logDistraction` - Add distraction entry
- Tool: `getDistractionAnalytics` - Get insights
- Component: Display journal and charts

### 4.2 Code Snippet Manager
**Component Name**: `CodeSnippets`
**File**: `src/components/productivity/code-snippets.tsx`

**Features:**
- Save code with title, language, tags
- Syntax highlighting (using highlight.js - already installed)
- Search and filter by language/tags
- Copy to clipboard
- Export snippets

**Zod Schema:**
```typescript
{
  language?: string
  tags?: string[]
  searchQuery?: string
}
```

**Redis Operations:**
- Store in `user:{userId}:snippets` hash (snippet ID -> JSON)
- Index by language and tags

**Tambo Registration:**
- Tool: `saveSnippet` - Add code snippet
- Tool: `searchSnippets` - Find snippets
- Component: Display snippet collection with syntax highlighting

### 4.3 Stand-up Log
**Component Name**: `StandupLog`
**File**: `src/components/productivity/standup-log.tsx`

**Features:**
- Daily 3-question format
  - What did I do?
  - What will I do?
  - Blockers?
- Calendar view of past entries
- Export weekly summary

**Zod Schema:**
```typescript
{
  date: string
  viewMode: 'today' | 'week' | 'month'
}
```

**Redis Operations:**
- Store in `user:{userId}:standup:log` sorted set
- Query by date for historical entries

**Tambo Registration:**
- Tool: `saveStandupEntry` - Log daily standup
- Tool: `getStandupHistory` - Fetch past entries
- Component: Display standup form and history

### 4.4 Energy Mapper
**Component Name**: `EnergyMapper`
**File**: `src/components/productivity/energy-mapper.tsx`

**Features:**
- Track energy levels (1-10 scale) throughout day
- Visual chart showing energy patterns
- Time-of-day insights
- Suggested optimal work hours

**Zod Schema:**
```typescript
{
  dateRange: { start: string, end: string }
  showInsights: boolean
}
```

**Redis Operations:**
- Store in `user:{userId}:energy:log` sorted set
- Analyze patterns for insights

**Tambo Registration:**
- Tool: `logEnergyLevel` - Record energy level
- Tool: `getEnergyInsights` - Analyze patterns
- Component: Display energy chart using Graph component

### 4.5 Weekly Review Template
**Component Name**: `WeeklyReview`
**File**: `src/components/productivity/weekly-review.tsx`

**Features:**
- Guided reflection prompts
- Auto-populate data from other modules:
  - Pomodoro sessions completed
  - Habits maintained
  - Energy patterns
- Export as markdown

**Zod Schema:**
```typescript
{
  weekStartDate: string
  includeMetrics: boolean
}
```

**Tambo Registration:**
- Tool: `generateWeeklyReview` - Compile week's data
- Component: Display review template with metrics

---

## Phase 5: Dashboard & Navigation

### 5.1 Main Dashboard
**File**: `src/app/dashboard/page.tsx`

**Layout:**
- Sidebar navigation (collapsible)
- Main content area with widget grid
- Top bar with user preferences

**Widgets:**
1. Active Pomodoro Timer (if running)
2. Today's habit checklist
3. Daily featured quote
4. Recent links (last 3)
5. Weekly pomodoro stats chart
6. Energy level quick-log

**Features:**
- Drag-and-drop widget reordering (optional for v1)
- Widget visibility toggles
- Dark mode toggle

**File**: `src/components/layout/dashboard-layout.tsx`
- Responsive sidebar with icons
- Navigation links to all modules

### 5.2 Navigation Structure
```
/ (landing page - existing)
/dashboard (main dashboard)
/pomodoro (dedicated timer page)
/habits (habit tracker page)
/links (link saver page)
/inspiration (quotes + rules guide)
/tools (creative tools hub)
  /tools/distractions
  /tools/snippets
  /tools/standup
  /tools/energy
  /tools/review
/settings (user preferences)
```

---

## Phase 6: Data Services & API Routes

### 6.1 Redis Service Layer
**File**: `src/services/redis-service.ts`

Create abstraction layer for all Redis operations:
```typescript
class RedisService {
  // User preferences
  async getUserPreferences(userId: string)
  async updateUserPreferences(userId: string, prefs: object)
  
  // Pomodoro
  async savePomodoroSession(userId: string, session: object)
  async getPomodoroStats(userId: string, dateRange: object)
  
  // Habits
  async createHabit(userId: string, habit: object)
  async getHabits(userId: string)
  async toggleHabitCompletion(userId: string, habitId: string, date: string)
  async calculateStreaks(userId: string, habitId: string)
  
  // Links
  async saveLink(userId: string, link: object)
  async searchLinks(userId: string, filters: object)
  async deleteLink(userId: string, linkId: string)
  
  // Quotes
  async saveFavoriteQuote(userId: string, quote: object)
  async getFavoriteQuotes(userId: string)
  
  // Creative tools
  async logDistraction(userId: string, entry: object)
  async saveSnippet(userId: string, snippet: object)
  async saveStandupEntry(userId: string, entry: object)
  async logEnergyLevel(userId: string, entry: object)
}
```

### 6.2 API Routes
**Files to Create:**

1. `src/app/api/pomodoro/route.ts`
   - GET: Fetch stats
   - POST: Save session

2. `src/app/api/habits/route.ts`
   - GET: Fetch habits
   - POST: Create habit
   - PATCH: Toggle completion
   - DELETE: Remove habit

3. `src/app/api/links/route.ts`
   - GET: Search links
   - POST: Save link
   - DELETE: Remove link

4. `src/app/api/quotes/route.ts`
   - GET: Fetch random quote (proxy to quotable.io)
   - POST: Save favorite

5. `src/app/api/tools/[tool]/route.ts`
   - Dynamic route for creative tools

### 6.3 External API Integration
**File**: `src/services/quotes-api.ts`

```typescript
async function fetchRandomQuote(tags?: string[]) {
  const tagsParam = tags?.join('|') || 'technology|future';
  const response = await fetch(
    `https://api.quotable.io/random?tags=${tagsParam}`
  );
  return response.json();
}
```

---

## Phase 7: Tambo AI Integration

### 7.1 Component Registration
**Update**: `src/lib/tambo.ts`

Register all productivity components:
```typescript
export const components: TamboComponent[] = [
  // Existing
  { name: "Graph", ... },
  { name: "DataCard", ... },
  
  // New Productivity Components
  {
    name: "PomodoroTimer",
    description: "Interactive Pomodoro timer with project tagging and session tracking",
    component: PomodoroTimer,
    propsSchema: pomodoroTimerSchema
  },
  {
    name: "HabitTracker",
    description: "Daily/weekly habit tracker with streak visualization",
    component: HabitTracker,
    propsSchema: habitTrackerSchema
  },
  {
    name: "LinkSaver",
    description: "Save and organize links with tagging and search",
    component: LinkSaver,
    propsSchema: linkSaverSchema
  },
  {
    name: "InspirationQuote",
    description: "Display motivational quotes for developers",
    component: InspirationQuote,
    propsSchema: inspirationQuoteSchema
  },
  {
    name: "ProductivityRules",
    description: "Cal Newport's Slow Productivity principles guide",
    component: ProductivityRules,
    propsSchema: productivityRulesSchema
  },
  {
    name: "DistractionJournal",
    description: "Log and analyze work interruptions",
    component: DistractionJournal,
    propsSchema: distractionJournalSchema
  },
  {
    name: "CodeSnippets",
    description: "Save and manage reusable code snippets with syntax highlighting",
    component: CodeSnippets,
    propsSchema: codeSnippetsSchema
  },
  {
    name: "StandupLog",
    description: "Daily standup meeting notes with 3-question format",
    component: StandupLog,
    propsSchema: standupLogSchema
  },
  {
    name: "EnergyMapper",
    description: "Track and visualize energy levels throughout the day",
    component: EnergyMapper,
    propsSchema: energyMapperSchema
  },
  {
    name: "WeeklyReview",
    description: "Guided weekly reflection with productivity metrics",
    component: WeeklyReview,
    propsSchema: weeklyReviewSchema
  },
  {
    name: "ProductivityDashboard",
    description: "Overview dashboard with multiple productivity widgets",
    component: ProductivityDashboard,
    propsSchema: productivityDashboardSchema
  }
];
```

### 7.2 Tool Registration
**Update**: `src/lib/tambo.ts`

Register all productivity tools:
```typescript
export const tools: TamboTool[] = [
  // Pomodoro Tools
  {
    name: "getPomodoroStats",
    description: "Get user's pomodoro statistics for a date range",
    tool: getPomodoroStats,
    inputSchema: z.object({
      startDate: z.string(),
      endDate: z.string(),
      groupBy: z.enum(['day', 'week', 'project']).optional()
    }),
    outputSchema: pomodoroStatsOutputSchema
  },
  {
    name: "startPomodoroSession",
    description: "Start a new pomodoro session with optional project tag",
    tool: startPomodoroSession,
    inputSchema: z.object({
      projectName: z.string().optional(),
      duration: z.number().default(25)
    }),
    outputSchema: z.object({ sessionId: z.string(), startTime: z.string() })
  },
  
  // Habit Tools
  {
    name: "getHabits",
    description: "Fetch all user habits with streak information",
    tool: getHabits,
    inputSchema: z.object({
      category: z.string().optional()
    }),
    outputSchema: z.array(habitSchema)
  },
  {
    name: "createHabit",
    description: "Create a new habit to track",
    tool: createHabit,
    inputSchema: z.object({
      name: z.string(),
      category: z.enum(['Code', 'Learn', 'Health', 'Review']),
      frequency: z.enum(['daily', 'weekly'])
    }),
    outputSchema: habitSchema
  },
  {
    name: "toggleHabit",
    description: "Mark a habit as complete or incomplete for a specific date",
    tool: toggleHabit,
    inputSchema: z.object({
      habitId: z.string(),
      date: z.string(),
      completed: z.boolean()
    }),
    outputSchema: z.object({ success: z.boolean(), streak: z.number() })
  },
  
  // Link Tools
  {
    name: "saveLink",
    description: "Save a new link to the collection",
    tool: saveLink,
    inputSchema: z.object({
      url: z.string().url(),
      title: z.string(),
      tags: z.array(z.string()),
      notes: z.string().optional()
    }),
    outputSchema: linkSchema
  },
  {
    name: "searchLinks",
    description: "Search saved links by query, tags, or filters",
    tool: searchLinks,
    inputSchema: z.object({
      query: z.string().optional(),
      tags: z.array(z.string()).optional(),
      sortBy: z.enum(['recent', 'title', 'tags']).optional()
    }),
    outputSchema: z.array(linkSchema)
  },
  
  // Quote Tools
  {
    name: "getRandomQuote",
    description: "Fetch a random inspirational quote for developers",
    tool: getRandomQuote,
    inputSchema: z.object({
      tags: z.array(z.string()).optional()
    }),
    outputSchema: quoteSchema
  },
  {
    name: "getFavoriteQuotes",
    description: "Get user's saved favorite quotes",
    tool: getFavoriteQuotes,
    inputSchema: z.object({}),
    outputSchema: z.array(quoteSchema)
  },
  
  // Creative Tools
  {
    name: "logDistraction",
    description: "Log a distraction or interruption during work",
    tool: logDistraction,
    inputSchema: z.object({
      description: z.string(),
      durationMinutes: z.number(),
      category: z.string().optional()
    }),
    outputSchema: z.object({ id: z.string(), timestamp: z.string() })
  },
  {
    name: "saveSnippet",
    description: "Save a reusable code snippet",
    tool: saveSnippet,
    inputSchema: z.object({
      title: z.string(),
      code: z.string(),
      language: z.string(),
      tags: z.array(z.string())
    }),
    outputSchema: snippetSchema
  },
  {
    name: "getProductivityInsights",
    description: "Get AI-generated insights based on user's productivity data",
    tool: getProductivityInsights,
    inputSchema: z.object({
      weekStartDate: z.string()
    }),
    outputSchema: z.object({
      summary: z.string(),
      achievements: z.array(z.string()),
      suggestions: z.array(z.string())
    })
  }
];
```

### 7.3 AI-Powered Features
**Conversational Productivity Assistant:**
- User can ask: "How many pomodoros did I complete this week?"
- AI uses `getPomodoroStats` tool and renders results with Graph component
- User can ask: "Show my habit streaks"
- AI uses `getHabits` tool and renders HabitTracker component
- User can say: "I got distracted for 15 minutes by a meeting"
- AI uses `logDistraction` tool and provides acknowledgment

**Intelligent Suggestions:**
- AI suggests creating habits based on pomodoro patterns
- AI recommends links based on recent work topics
- AI generates weekly review insights from aggregated data

---

## Phase 8: Authentication & User Management

### 8.1 User Identification
**Options:**
1. **Simple Session-Based** (for MVP):
   - Generate UUID on first visit
   - Store in localStorage
   - Use as Redis key prefix

2. **Full Authentication** (for production):
   - Integrate Clerk/NextAuth
   - Use authenticated user ID for Redis keys
   - Multi-device sync support

**File**: `src/lib/auth.ts`
```typescript
function getUserId(): string {
  // For MVP: localStorage UUID
  // For production: Get from auth session
}
```

### 8.2 User Preferences
**File**: `src/components/settings/user-preferences.tsx`

Settings page for:
- Pomodoro duration customization
- Theme toggle (light/dark)
- Notification preferences
- Data export/import
- Account management

---

## Phase 9: UI/UX Enhancements

### 9.1 Animations & Transitions
- Use `framer-motion` (already installed)
- Smooth page transitions
- Widget fade-in effects
- Timer pulsing animation
- Habit completion celebration

### 9.2 Notifications
**File**: `src/lib/notifications.ts`

- Browser notifications for pomodoro completion
- Gentle sound alerts (optional)
- Visual toast messages for actions
- Permission request on first timer use

### 9.3 Responsive Design
- Mobile-first approach
- Collapsible sidebar on mobile
- Touch-friendly controls
- Swipe gestures for navigation (optional)

### 9.4 Accessibility
- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader friendly
- High contrast mode compatibility

---

## Phase 10: Testing & Deployment

### 10.1 Testing Strategy
**Manual Testing Checklist:**
- [ ] Pomodoro timer starts/pauses correctly
- [ ] Habits save to Redis and persist
- [ ] Links can be added, searched, deleted
- [ ] Quotes fetch from API successfully
- [ ] Tambo AI can invoke all tools
- [ ] Dashboard widgets display correct data
- [ ] Theme applies consistently
- [ ] Mobile responsive on all pages

**Data Validation:**
- All Zod schemas validate input correctly
- Redis operations handle errors gracefully
- API routes return proper status codes

### 10.2 Performance Optimization
- Redis queries optimized with proper indexing
- Implement pagination for link/snippet lists
- Lazy load dashboard widgets
- Cache quote API responses
- Optimize bundle size (code splitting)

### 10.3 Deployment
**Environment Setup:**
1. Upstash Redis database created
2. Environment variables configured
3. Vercel/Netlify deployment

**Deployment Checklist:**
- [ ] Redis connection tested in production
- [ ] API keys secured (not in client bundle)
- [ ] Error tracking setup (Sentry optional)
- [ ] Analytics setup (Plausible/Vercel Analytics)
- [ ] Performance monitoring

---

## Implementation Timeline

### Week 1: Foundation (Phase 1-2)
- Days 1-2: Redis setup + theme implementation
- Days 3-4: Pomodoro timer component
- Days 5-7: Habit tracker component

### Week 2: Core Features (Phase 2-3)
- Days 1-3: Link saver component
- Days 4-5: Inspiration quotes + rules guide
- Days 6-7: Dashboard layout

### Week 3: Creative Tools (Phase 4)
- Days 1-2: Distraction journal + code snippets
- Days 3-4: Standup log + energy mapper
- Days 5-7: Weekly review + integrations

### Week 4: Polish & Launch (Phase 5-10)
- Days 1-2: Navigation, routing, settings
- Days 3-4: Tambo AI tool registration + testing
- Days 5-6: UI/UX polish, animations
- Day 7: Testing, deployment, documentation

---

## File Structure (New Files)

```
crowdlens/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   └── page.tsx (main dashboard)
│   │   ├── pomodoro/
│   │   │   └── page.tsx
│   │   ├── habits/
│   │   │   └── page.tsx
│   │   ├── links/
│   │   │   └── page.tsx
│   │   ├── inspiration/
│   │   │   └── page.tsx
│   │   ├── tools/
│   │   │   ├── page.tsx (hub)
│   │   │   ├── distractions/
│   │   │   ├── snippets/
│   │   │   ├── standup/
│   │   │   ├── energy/
│   │   │   └── review/
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── api/
│   │       ├── pomodoro/route.ts
│   │       ├── habits/route.ts
│   │       ├── links/route.ts
│   │       ├── quotes/route.ts
│   │       └── tools/[tool]/route.ts
│   ├── components/
│   │   ├── productivity/
│   │   │   ├── pomodoro-timer.tsx
│   │   │   ├── habit-tracker.tsx
│   │   │   ├── link-saver.tsx
│   │   │   ├── inspiration-quote.tsx
│   │   │   ├── rules-guide.tsx
│   │   │   ├── distraction-journal.tsx
│   │   │   ├── code-snippets.tsx
│   │   │   ├── standup-log.tsx
│   │   │   ├── energy-mapper.tsx
│   │   │   └── weekly-review.tsx
│   │   ├── layout/
│   │   │   ├── dashboard-layout.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── top-bar.tsx
│   │   └── settings/
│   │       └── user-preferences.tsx
│   ├── lib/
│   │   ├── redis.ts (Redis client)
│   │   ├── redis-keys.ts (Key naming)
│   │   ├── auth.ts (User ID management)
│   │   ├── theme.ts (Theme constants)
│   │   └── notifications.ts
│   ├── services/
│   │   ├── redis-service.ts (abstraction layer)
│   │   ├── pomodoro-service.ts
│   │   ├── habit-service.ts
│   │   ├── link-service.ts
│   │   ├── quote-service.ts
│   │   └── quotes-api.ts
│   ├── types/
│   │   ├── pomodoro.ts
│   │   ├── habit.ts
│   │   ├── link.ts
│   │   ├── quote.ts
│   │   └── user.ts
│   └── hooks/
│       ├── use-pomodoro.ts
│       ├── use-habits.ts
│       ├── use-links.ts
│       └── use-user-preferences.ts
└── .env.local
```

---

## Dependencies to Install

```bash
npm install @upstash/redis      # Redis client for Upstash
npm install zustand             # State management
npm install date-fns            # Date utilities
npm install @radix-ui/react-dialog @radix-ui/react-select  # UI primitives
npm install react-hot-toast     # Toast notifications
npm install uuid                # Generate IDs
npm install @types/uuid --save-dev
```

---

## Key Design Patterns

### 1. Service Layer Pattern
All Redis operations abstracted into service classes:
```typescript
// Bad: Direct Redis in components
await redis.set(`user:${userId}:data`, data);

// Good: Service abstraction
await userService.saveUserData(userId, data);
```

### 2. Optimistic UI Updates
Update UI immediately, sync with Redis in background:
```typescript
// Mark habit complete immediately
setHabits(prev => updateLocal(prev, habitId));

// Then sync
await habitService.toggleHabit(userId, habitId, date);
```

### 3. Tambo Tool Composition
Complex operations composed from multiple tools:
```typescript
// AI can chain tools:
// 1. Get pomodoro stats
// 2. Get habit data
// 3. Render dashboard with Graph component
```

### 4. Redis Key Namespacing
Consistent key structure for easy querying:
```typescript
const KEYS = {
  userPrefs: (userId: string) => `user:${userId}:preferences`,
  pomodoroSessions: (userId: string) => `user:${userId}:pomodoro:sessions`,
  habitLog: (userId: string, date: string) => `user:${userId}:habits:log:${date}`
};
```

---

## Success Metrics (Post-Launch)

### Technical Metrics
- [ ] All Tambo components render correctly via AI
- [ ] All tools invokable by AI assistant
- [ ] Redis operations < 100ms average
- [ ] Page load time < 2s
- [ ] Mobile responsive on all devices

### User Experience Metrics
- [ ] Pomodoro sessions logged successfully
- [ ] Habit streak calculations accurate
- [ ] Link search returns relevant results
- [ ] Quotes refresh daily
- [ ] Dashboard loads without errors

### Data Integrity
- [ ] No data loss on page refresh
- [ ] Redis keys expire correctly (where applicable)
- [ ] User preferences persist across sessions

---

## Future Enhancements (Post-MVP)

### Version 2.0 Features
1. **GitHub Integration**
   - Link commits to pomodoro sessions
   - Auto-tag projects from repo names
   - Display commit activity in weekly review

2. **VS Code Extension**
   - Quick-save links from editor
   - Start pomodoro from command palette
   - Show habit reminders in status bar

3. **Team Features**
   - Share productivity rules
   - Team pomodoro sessions
   - Collaborative link collections

4. **Advanced Analytics**
   - ML-powered productivity predictions
   - Optimal work time recommendations
   - Focus score calculation

5. **Browser Extension**
   - One-click link saving
   - Timer in browser toolbar
   - Page time tracking

6. **Offline PWA Support**
   - Service worker for offline access
   - Sync queue for Redis updates
   - Local-first architecture

---

## Risk Mitigation

### Technical Risks
1. **Redis Connection Issues**
   - Mitigation: Implement retry logic, fallback to localStorage
   - Graceful degradation if Redis unavailable

2. **Tambo AI Hallucination**
   - Mitigation: Strict Zod schemas, input validation
   - Clear component descriptions

3. **Quote API Rate Limiting**
   - Mitigation: Cache quotes in Redis (24h TTL)
   - Fallback to curated static quotes

### UX Risks
1. **Feature Bloat**
   - Mitigation: Start with MVP, add features iteratively
   - User feedback before adding complexity

2. **Overwhelming Dashboard**
   - Mitigation: Customizable widgets, minimal default view
   - Progressive disclosure of advanced features

---

## Development Best Practices

### Code Organization
- One component per file
- Separate business logic into services
- Co-locate types with components
- Use barrel exports (index.ts)

### TypeScript
- Strict mode enabled
- No `any` types
- Use Zod for runtime validation
- Define interfaces for all data structures

### Git Workflow
- Feature branches for each component
- Commit messages follow conventional commits
- PR reviews before merging to main

### Documentation
- JSDoc comments for all exported functions
- README in each major directory
- API route documentation
- Component prop documentation

---

## Conclusion

This implementation plan provides a comprehensive roadmap for building **ProductivityFlow** using Tambo AI and Upstash Redis. The phased approach ensures:

✅ **Solid Foundation**: Redis setup, theme, authentication  
✅ **Core Features**: Pomodoro, habits, links delivered early  
✅ **AI Integration**: All components and tools Tambo-enabled  
✅ **Polish**: Smooth UX, animations, accessibility  
✅ **Scalability**: Service layer, proper architecture for growth  

**Next Steps:**
1. Review and approve this plan
2. Set up Upstash Redis database
3. Begin Phase 1 implementation
4. Iterate based on user feedback

Let's build a calm, focused productivity ecosystem for developers! 🧘‍♂️💻
