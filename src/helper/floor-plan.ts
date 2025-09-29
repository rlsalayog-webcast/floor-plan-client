import type Konva from "konva";
import type { FloorPlanElement } from "../types/FloorPlan";

export function getDragBoundFunc(
    pos: { x: number; y: number },
    element: FloorPlanElement,
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

    switch (element.type) {
        case "rectangle":
            width = element.width! + strokeWidth;
            height = element.height! + strokeWidth;
            break;

        case "circle":
            width = element.radius! * 2 + strokeWidth;
            height = element.radius! * 2 + strokeWidth;
            offsetX = element.radius!;
            offsetY = element.radius!;
            break;
    }

    // Convert pos to unscaled
    const adjustedX = pos.x / scale;
    const adjustedY = pos.y / scale;

    // Clamp position so element stays inside stage
    const newX = Math.max(offsetX, Math.min(adjustedX, stageWidth - width + offsetX));
    const newY = Math.max(offsetY, Math.min(adjustedY, stageHeight - height + offsetY));

    // Return scaled back position
    return { x: newX * scale, y: newY * scale };
}

/**
 * Used in useDragWithCollision hook to avoid shapes colliding to each other
 */
export type Shape =
    | { type: "rectangle"; x: number; y: number; width: number; height: number }
    | { type: "circle"; x: number; y: number; radius: number };

export const shapesIntersect = (a: Shape, b: Shape): boolean => {
    if (a.type === "rectangle" && b.type === "rectangle") {
        return !(
            a.x + a.width <= b.x ||
            a.x >= b.x + b.width ||
            a.y + a.height <= b.y ||
            a.y >= b.y + b.height
        );
    }

    if (a.type === "circle" && b.type === "circle") {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < a.radius + b.radius;
    }

    const circle = a.type === "circle" ? a : (b as Shape & { radius: number });
    const rect = a.type === "rectangle" ? a : (b as Shape & { width: number; height: number });

    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    return dx * dx + dy * dy < circle.radius * circle.radius;
};
