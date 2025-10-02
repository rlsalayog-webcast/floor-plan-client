import type Konva from "konva";
import type { IFloorPlanArea } from "../types/FloorPlan";

export function getDragBoundFunc(
    pos: { x: number; y: number },
    element: IFloorPlanArea,
    stage: Konva.Stage
) {
    const scale = stage.scaleX();
    const stageWidth = stage.width() / scale;
    const stageHeight = stage.height() / scale;

    // Fallback strokeWidth to 0 if not defined
    const strokeWidth = 1;
    const halfStroke = strokeWidth / 2;

    // Determine dimensions and offset dynamically
    let width = 0;
    let height = 0;
    let offsetX = halfStroke;
    let offsetY = halfStroke;

    width = element.width! + strokeWidth;
    height = element.height! + strokeWidth;

    // Convert pos to unscaled
    const adjustedX = pos.x / scale;
    const adjustedY = pos.y / scale;

    // Clamp position so element stays inside stage
    const newX = Math.max(offsetX, Math.min(adjustedX, stageWidth - width + offsetX));
    const newY = Math.max(offsetY, Math.min(adjustedY, stageHeight - height + offsetY));

    // Return scaled back position
    return { x: newX * scale, y: newY * scale };
}
