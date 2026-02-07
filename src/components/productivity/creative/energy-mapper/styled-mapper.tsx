"use client";

import React from "react";
import { EnergyMapper, EnergyLevel } from "./index";
import { z } from "zod";
import { Activity, Battery, BatteryMedium, BatteryLow, BatteryFull, TrendingUp, Info } from "lucide-react";
import { format } from "date-fns";
import { useEnergyMapperContext } from "./energy-mapper-context";
import { cn } from "@/lib/utils";

export const energyMapperSchema = z.object({
    initialEnergyData: z.array(z.any()).optional(),
});

type EnergyMapperProps = z.infer<typeof energyMapperSchema>;

const MapperInner = () => {
    const { energyData, logEnergy, isLoading } = useEnergyMapperContext();
    const [level, setLevel] = React.useState(7);
    const [notes, setNotes] = React.useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        logEnergy(level, notes);
        setNotes("");
    };

    const getEnergyIcon = (l: number) => {
        if (l <= 3) return <BatteryLow className="w-8 h-8 text-destructive" />;
        if (l <= 7) return <BatteryMedium className="w-8 h-8 text-yellow-500" />;
        return <BatteryFull className="w-8 h-8 text-primary" />;
    };

    const getLevelColor = (l: number) => {
        if (l <= 3) return "bg-destructive/10 text-destructive border-destructive/20";
        if (l <= 7) return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
        return "bg-primary/10 text-primary border-primary/20";
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Energy Mapper</h2>
                        <p className="text-sm text-muted-foreground">Track your productivity rhythm</p>
                    </div>
                </div>
            </div>

            {/* Log Form */}
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-foreground">Current Energy Level</label>
                            <span className={`px-2.5 py-0.5 rounded-full text-lg font-bold border ${getLevelColor(level)}`}>
                                {level}/10
                            </span>
                        </div>

                        <div className="flex items-center justify-center gap-4 py-2">
                            {getEnergyIcon(level)}
                            <input
                                type="range"
                                min="1"
                                max="10"
                                step="1"
                                value={level}
                                onChange={(e) => setLevel(parseInt(e.target.value))}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                        <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground px-1 tracking-widest">
                            <span>Low</span>
                            <span>Optimal</span>
                            <span>Peak</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Info className="w-4 h-4 text-muted-foreground" />
                            Notes (What's affecting your energy?)
                        </label>
                        <input
                            placeholder="e.g., Post-lunch slump, morning coffee kick..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full h-11 px-4 rounded-xl bg-background border border-input focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 px-4 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                        {isLoading ? "Saving..." : "Log Energy Check-in"}
                        <TrendingUp className="w-4 h-4" />
                    </button>
                </form>
            </div>

            {/* Daily Rhythm (Simple List) */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground px-2">Daily Logs</h3>
                <EnergyMapper.Items>
                    {({ items }: { items: EnergyLevel[] }) => (
                        <div className="space-y-3">
                            {items.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground bg-muted/5 rounded-2xl border border-dashed border-muted">
                                    No energy logs today.
                                </div>
                            ) : (
                                items.map((item: EnergyLevel) => (
                                    <div key={item.id} className="bg-card rounded-xl p-4 border border-border shadow-sm flex items-center gap-4 hover:border-primary/20 transition-all">
                                        <div className={cn(
                                            "w-12 h-12 flex items-center justify-center rounded-full text-lg font-bold border-2",
                                            item.level <= 3 ? "bg-destructive/10 text-destructive border-destructive/20" :
                                                item.level <= 7 ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" :
                                                    "bg-primary/10 text-primary border-primary/20"
                                        )}>
                                            {item.level}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-foreground truncate">{item.notes || "Check-in"}</div>
                                            <div className="text-xs text-muted-foreground">{format(new Date(item.timestamp), "h:mm a")}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </EnergyMapper.Items>
            </div>
        </div>
    );
};

export const StyledEnergyMapper = ({ initialEnergyData }: EnergyMapperProps) => {
    return (
        <EnergyMapper.Root initialEnergyData={initialEnergyData} className="max-w-md mx-auto p-4">
            <MapperInner />
        </EnergyMapper.Root>
    );
};
