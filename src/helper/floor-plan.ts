import type Konva from "konva";
import type { FloorPlanElement } from "../types/FloorPlan";

/**
 * Returns a dragBoundFunc for any shape that constrains movement
 * inside the stage boundaries, including stroke width.
 */
export function getDragBoundFunc(
    element: FloorPlanElement,
    stageRef: React.RefObject<Konva.Stage | null>
) {
    return (pos: { x: number; y: number }) => {
        const stage = stageRef.current;
        const stageWidth = stage?.width() ?? 0;
        const stageHeight = stage?.height() ?? 0;

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
                // Circle is centered, so adjust offsets to keep it fully inside
                offsetX = element.radius! + halfStroke;
                offsetY = element.radius! + halfStroke;
                break;

            default:
                break;
        }

        // Clamp position so element stays inside stage
        const newX = Math.max(offsetX, Math.min(pos.x, stageWidth - width + offsetX));
        const newY = Math.max(offsetY, Math.min(pos.y, stageHeight - height + offsetY));

        return { x: newX, y: newY };
    };
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
