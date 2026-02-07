/**
 * @file productivity-rules.tsx
 * @description Tambo generative component for Cal Newport's Slow Productivity rules
 */

"use client";

import { z } from "zod";
import { useState } from "react";
import { theme } from "@/lib/theme";

export const productivityRulesSchema = z.object({
  showProgress: z.boolean().default(true).describe("Show progress indicators"),
  practicedRules: z.array(z.number()).default([]).describe("IDs of rules marked as practiced"),
});

type ProductivityRulesProps = z.infer<typeof productivityRulesSchema>;

export function ProductivityRules({
  showProgress = true,
  practicedRules = [],
}: ProductivityRulesProps) {
  const [practiced, setPracticed] = useState<number[]>(practicedRules);
  const [expandedRule, setExpandedRule] = useState<number | null>(null);

  const togglePracticed = (ruleId: number) => {
    setPracticed((prev) =>
      prev.includes(ruleId)
        ? prev.filter((id) => id !== ruleId)
        : [...prev, ruleId]
    );
  };

  const toggleExpanded = (ruleId: number) => {
    setExpandedRule(expandedRule === ruleId ? null : ruleId);
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          📘 Slow Productivity Principles
        </h2>
        <p className="text-muted-foreground">
          Cal Newport's framework for sustainable, meaningful work
        </p>
        {showProgress && (
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${(practiced.length / theme.productivityRules.length) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {practiced.length}/{theme.productivityRules.length}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Rules */}
      <div className="space-y-4">
        {theme.productivityRules.map((rule) => {
          const isPracticed = practiced.includes(rule.id);
          const isExpanded = expandedRule === rule.id;

          return (
            <div
              key={rule.id}
              className={`rounded-lg border-2 transition-all ${
                isPracticed
                  ? "bg-primary/5 border-primary/30"
                  : "bg-muted/30 border-border"
              }`}
            >
              {/* Rule Header */}
              <div
                className="p-5 cursor-pointer"
                onClick={() => toggleExpanded(rule.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Number Badge */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                      isPracticed
                        ? "bg-primary text-white"
                        : "bg-primary/20 text-primary"
                    }`}
                  >
                    {rule.id}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {rule.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {rule.shortDesc}
                    </p>
                  </div>

                  {/* Expand Icon */}
                  <button className="text-2xl text-muted-foreground hover:text-foreground transition-colors">
                    {isExpanded ? "−" : "+"}
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-border/50">
                  <div className="pt-4 space-y-4">
                    {/* Explanation */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">💡 Why it matters:</h4>
                      <p className="text-muted-foreground">{rule.explanation}</p>
                    </div>

                    {/* Tips */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">✨ How to apply:</h4>
                      <ul className="space-y-2">
                        {rule.tips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-accent mt-1">→</span>
                            <span className="text-muted-foreground flex-1">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Example */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">🎯 Example:</h4>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md italic">
                        {rule.example}
                      </p>
                    </div>

                    {/* Practice Button */}
                    <div className="pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePracticed(rule.id);
                        }}
                        className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                          isPracticed
                            ? "bg-primary text-white hover:bg-primary/90"
                            : "bg-primary/10 text-primary hover:bg-primary/20"
                        }`}
                      >
                        {isPracticed ? "✓ Practiced" : "Mark as Practiced"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          Based on Cal Newport's{" "}
          <span className="font-semibold text-foreground">"Slow Productivity"</span> philosophy
        </p>
      </div>
    </div>
  );
}
