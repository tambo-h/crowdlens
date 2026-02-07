import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { EnergyMapperContext, EnergyLevel } from "./energy-mapper-context";
import { logEnergyLevel as logEnergyService } from "@/services/productivity-service";

export interface EnergyMapperRootProps {
    children: React.ReactNode;
    asChild?: boolean;
    initialEnergyData?: EnergyLevel[];
    className?: string;
}

export const EnergyMapperRoot = React.forwardRef<HTMLDivElement, EnergyMapperRootProps>(
    ({ children, asChild, initialEnergyData = [], ...props }, ref) => {
        const [energyData, setEnergyData] = React.useState<EnergyLevel[]>(initialEnergyData);
        const [isLoading, setIsLoading] = React.useState(false);

        // Sync with prop changes
        React.useEffect(() => {
            if (initialEnergyData) {
                setEnergyData(initialEnergyData);
            }
        }, [initialEnergyData]);

        const logEnergy = async (level: number, notes?: string) => {
            setIsLoading(true);
            try {
                const result = await logEnergyService({ level, notes });
                const newEntry: EnergyLevel = {
                    id: result.id,
                    level,
                    notes,
                    timestamp: result.timestamp,
                };
                setEnergyData((prev) => [...prev, newEntry]);
            } catch (error) {
                console.error("Failed to log energy:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const Comp = asChild ? Slot : "div";

        return (
            <EnergyMapperContext.Provider value={{ energyData, isLoading, logEnergy }}>
                <Comp ref={ref} {...props}>
                    {children}
                </Comp>
            </EnergyMapperContext.Provider>
        );
    }
);

EnergyMapperRoot.displayName = "EnergyMapper.Root";
