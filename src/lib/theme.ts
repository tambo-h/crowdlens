/**
 * @file theme.ts
 * @description Theme constants and utilities for ProductivityFlow
 * 
 * This file contains the Calm Dev theme configuration including colors,
 * typography, spacing, and animation settings.
 */

/**
 * Calm Dev Color Palette
 * Soft blues, off-whites, and muted greens for a calming developer experience
 */
export const colors = {
  // Primary Colors - Soft Blues
  primary: {
    blue: "#A2D2FF",
    blueLight: "#BDE0FE",
    blueDark: "#7BAFD4",
  },

  // Background Colors - Off-white and light grays
  background: {
    main: "#FAF9F6",
    surface: "#F5F7FA",
    card: "#FFFFFF",
  },

  // Dark Mode Backgrounds
  backgroundDark: {
    main: "#1A1D23",
    surface: "#22262E",
    card: "#2A2F3A",
  },

  // Accent Colors
  accent: {
    green: "#95D5B2",
    greenDark: "#7DB99A",
  },

  // Text Colors - Charcoal grays
  text: {
    primary: "#2D3436",
    secondary: "#636E72",
    muted: "#95A5A6",
  },

  // Dark Mode Text
  textDark: {
    primary: "#E8EAED",
    secondary: "#B8BDC5",
    muted: "#868C98",
  },

  // Semantic Colors
  semantic: {
    success: "#95D5B2",
    warning: "#FFE17F",
    error: "#FF8B94",
    info: "#A2D2FF",
  },
} as const;

/**
 * Typography Settings
 * Inter for headings, system fonts for body
 */
export const typography = {
  fonts: {
    heading: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
    mono: "'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace",
  },

  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  sizes: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
  },
} as const;

/**
 * Spacing Scale
 * Based on 4px base unit for consistent rhythm
 */
export const spacing = {
  0: "0",
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
  20: "5rem", // 80px
} as const;

/**
 * Border Radius
 * Smooth, rounded corners for calm aesthetic
 */
export const borderRadius = {
  none: "0",
  sm: "0.25rem", // 4px
  md: "0.5rem", // 8px
  lg: "0.75rem", // 12px
  xl: "1rem", // 16px
  full: "9999px",
} as const;

/**
 * Shadows
 * Subtle shadows for depth without harshness
 */
export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
  none: "none",
} as const;

/**
 * Animation Durations
 * Smooth, gentle transitions
 */
export const animations = {
  duration: {
    fast: "150ms",
    normal: "250ms",
    slow: "400ms",
    slower: "600ms",
  },

  easing: {
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
    spring: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
} as const;

/**
 * Pomodoro Timer Settings
 * Default durations in minutes
 */
export const pomodoroDefaults = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  cyclesBeforeLongBreak: 4,
} as const;

/**
 * Habit Categories
 * Predefined categories for habit tracking
 */
export const habitCategories = [
  { id: "code", label: "Code", color: colors.primary.blue },
  { id: "learn", label: "Learn", color: colors.accent.green },
  { id: "health", label: "Health", color: colors.semantic.success },
  { id: "review", label: "Review", color: colors.semantic.info },
] as const;

/**
 * Productivity Rules (Cal Newport's Slow Productivity)
 */
export const productivityRules = [
  {
    id: 1,
    title: "Do Fewer Things",
    shortDesc: "Limit active projects to maintain quality",
    explanation:
      "Focus on 2-3 active projects maximum. Quality over quantity leads to better outcomes and less stress.",
    tips: [
      "Use a project queue - start new work only when current projects complete",
      "Say no strategically to protect your focus",
      "Bundle small tasks into dedicated time blocks",
    ],
    example:
      "Instead of juggling 5 feature branches, focus on shipping one feature at a time with high quality. Keep other ideas in a backlog.",
  },
  {
    id: 2,
    title: "Work at a Natural Pace",
    shortDesc: "Sustainable productivity over sprints",
    explanation:
      "Avoid burnout by working at a consistent, sustainable pace. Marathon, not sprint.",
    tips: [
      "Schedule regular breaks using the Pomodoro technique",
      "Respect your energy levels - do deep work when you're freshest",
      "Take real time off to recharge creativity",
    ],
    example:
      "Code for 25 minutes, take a 5-minute break. After 4 cycles, take a longer 15-minute break to recharge.",
  },
  {
    id: 3,
    title: "Obsess Over Quality",
    shortDesc: "Pride in craft drives satisfaction",
    explanation:
      "Do fewer things, but do them exceptionally well. Quality work is more fulfilling than quantity.",
    tips: [
      "Refactor and polish your code before moving on",
      "Write comprehensive tests and documentation",
      "Seek code reviews and give thoughtful feedback",
    ],
    example:
      "Before marking a feature 'done', review your code, add tests, update docs, and ensure it meets your quality standards.",
  },
] as const;

/**
 * Z-Index Scale
 * Consistent layering across the app
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

/**
 * Breakpoints for responsive design
 */
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

/**
 * Theme configuration object
 * Complete theme settings in one place
 */
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  pomodoroDefaults,
  habitCategories,
  productivityRules,
  zIndex,
  breakpoints,
} as const;

export default theme;
