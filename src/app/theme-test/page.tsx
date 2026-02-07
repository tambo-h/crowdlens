/**
 * @file page.tsx
 * @description Test page to verify Calm Dev theme application
 */

"use client";

import { theme } from "@/lib/theme";

export default function ThemeTestPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Calm Dev Theme Test
          </h1>
          <p className="text-muted-foreground">
            Verifying ProductivityFlow theme application
          </p>
        </div>

        {/* Color Palette */}
        <div className="bg-card rounded-lg p-6 shadow-md space-y-4">
          <h2 className="text-2xl font-semibold">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div
                className="h-20 rounded-md"
                style={{ backgroundColor: theme.colors.primary.blue }}
              />
              <p className="text-sm font-medium">Primary Blue</p>
              <p className="text-xs text-muted-foreground">
                {theme.colors.primary.blue}
              </p>
            </div>
            <div className="space-y-2">
              <div
                className="h-20 rounded-md"
                style={{ backgroundColor: theme.colors.primary.blueLight }}
              />
              <p className="text-sm font-medium">Primary Blue Light</p>
              <p className="text-xs text-muted-foreground">
                {theme.colors.primary.blueLight}
              </p>
            </div>
            <div className="space-y-2">
              <div
                className="h-20 rounded-md"
                style={{ backgroundColor: theme.colors.accent.green }}
              />
              <p className="text-sm font-medium">Accent Green</p>
              <p className="text-xs text-muted-foreground">
                {theme.colors.accent.green}
              </p>
            </div>
            <div className="space-y-2">
              <div
                className="h-20 rounded-md border-2"
                style={{ backgroundColor: theme.colors.background.surface }}
              />
              <p className="text-sm font-medium">Background Surface</p>
              <p className="text-xs text-muted-foreground">
                {theme.colors.background.surface}
              </p>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="bg-card rounded-lg p-6 shadow-md space-y-4">
          <h2 className="text-2xl font-semibold">Typography</h2>
          <div className="space-y-3">
            <h1 className="text-4xl">Heading 1 - 36px</h1>
            <h2 className="text-3xl">Heading 2 - 30px</h2>
            <h3 className="text-2xl">Heading 3 - 24px</h3>
            <h4 className="text-xl">Heading 4 - 20px</h4>
            <p className="text-base">Body text - 16px (base)</p>
            <p className="text-sm text-muted-foreground">
              Small text - 14px (muted)
            </p>
          </div>
        </div>

        {/* Components */}
        <div className="bg-card rounded-lg p-6 shadow-md space-y-4">
          <h2 className="text-2xl font-semibold">UI Components</h2>

          {/* Buttons */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
                Primary Button
              </button>
              <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-opacity">
                Secondary Button
              </button>
              <button className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:opacity-90 transition-opacity">
                Accent Button
              </button>
              <button className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors">
                Outline Button
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Cards</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Muted Card</h4>
                <p className="text-sm text-muted-foreground">
                  This is a card with muted background.
                </p>
              </div>
              <div className="bg-card border border-border p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Bordered Card</h4>
                <p className="text-sm text-muted-foreground">
                  This is a card with border.
                </p>
              </div>
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-2">Accent Card</h4>
                <p className="text-sm text-muted-foreground">
                  This is a card with primary accent.
                </p>
              </div>
            </div>
          </div>

          {/* Form Elements */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Form Elements</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Text input"
                className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <textarea
                placeholder="Textarea"
                rows={3}
                className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Productivity Rules Preview */}
        <div className="bg-card rounded-lg p-6 shadow-md space-y-4">
          <h2 className="text-2xl font-semibold">Productivity Rules</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {theme.productivityRules.map((rule) => (
              <div
                key={rule.id}
                className="bg-muted/50 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
                    {rule.id}
                  </span>
                  <h3 className="font-semibold">{rule.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {rule.shortDesc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Habit Categories */}
        <div className="bg-card rounded-lg p-6 shadow-md space-y-4">
          <h2 className="text-2xl font-semibold">Habit Categories</h2>
          <div className="flex flex-wrap gap-3">
            {theme.habitCategories.map((category) => (
              <div
                key={category.id}
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: `${category.color}20`,
                  color: category.color,
                  border: `2px solid ${category.color}40`,
                }}
              >
                {category.label}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-8">
          <p>✓ Calm Dev theme successfully applied</p>
          <p className="mt-2">
            Visit{" "}
            <a href="/" className="text-primary hover:underline">
              home page
            </a>{" "}
            or{" "}
            <a href="/chat" className="text-primary hover:underline">
              chat page
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
