import React from "react";

export interface EnergyLevel {
    id: string;
    level: number; // 1-10
    notes?: string;
    timestamp: string;
}

export interface EnergyMapperContextValue {
    energyData: EnergyLevel[];
    isLoading: boolean;
    logEnergy: (level: number, notes?: string) => Promise<void>;
}

const EnergyMapperContext = React.createContext<EnergyMapperContextValue | null>(null);

export function useEnergyMapperContext() {
    const context = React.useContext(EnergyMapperContext);
    if (!context) {
        throw new Error("EnergyMapper parts must be used within EnergyMapper.Root");
    }
    return context;
}

export { EnergyMapperContext };
