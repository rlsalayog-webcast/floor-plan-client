import React from "react";
import { Line } from "react-konva";

interface IGridLinesBg {
    width: number;
    height: number;
    cellSize?: number;
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;
}

const GridLinesBg: React.FC<IGridLinesBg> = ({
    width,
    height,
    cellSize = 40,
    stroke = "hsl(0 0% 10%)",
    strokeWidth = 0.5,
    opacity = 0.3,
}) => {
    const cols = Math.ceil(width / cellSize);
    const rows = Math.ceil(height / cellSize);

    return (
        <>
            {Array.from({ length: cols }, (_, i) => (
                <Line
                    key={`v-${i}`}
                    points={[i * cellSize, 0, i * cellSize, height]}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    opacity={opacity}
                />
            ))}
            {Array.from({ length: rows }, (_, i) => (
                <Line
                    key={`h-${i}`}
                    points={[0, i * cellSize, width, i * cellSize]}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    opacity={opacity}
                />
            ))}
        </>
    );
};

export default GridLinesBg;
