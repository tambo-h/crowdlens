import React from "react";
import { useEnergyMapperContext, EnergyLevel } from "./energy-mapper-context";

export interface EnergyMapperItemsProps {
    children: (props: { items: EnergyLevel[] }) => React.ReactNode;
}

export const EnergyMapperItems = ({ children }: EnergyMapperItemsProps) => {
    const { energyData } = useEnergyMapperContext();

    const items = React.useMemo(() => energyData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [energyData]);

    return <>{children({ items })}</>;
};

EnergyMapperItems.displayName = "EnergyMapper.Items";
