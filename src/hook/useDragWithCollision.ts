import type Konva from "konva";
import { useRef } from "react";
import { shapesIntersect, type Shape } from "../helper/floor-plan";
import type { FloorPlanElement } from "../types/FloorPlan";

/**
 * To avoid shapes colliding to each other
 */
export const useDragWithCollision = () => {
    const lastValidPositionRef = useRef<Record<string, { x: number; y: number }>>({});

    const getDragMoveHandler = (
        element: FloorPlanElement,
        elements: FloorPlanElement[]
    ): ((e: Konva.KonvaEventObject<DragEvent>) => void) => {
        return (e) => {
            const newX = e.target.x();
            const newY = e.target.y();

            const movingShape: Shape =
                element.type === "rectangle"
                    ? {
                          type: "rectangle",
                          x: newX,
                          y: newY,
                          width: element.width!,
                          height: element.height!,
                      }
                    : { type: "circle", x: newX, y: newY, radius: element.radius! };

            const isOverlapping = elements.some((el) => {
                if (el.id === element.id) return false;
                const otherShape: Shape =
                    el.type === "rectangle"
                        ? {
                              type: "rectangle",
                              x: el.x,
                              y: el.y,
                              width: el.width!,
                              height: el.height!,
                          }
                        : { type: "circle", x: el.x, y: el.y, radius: el.radius! };
                return shapesIntersect(movingShape, otherShape);
            });

            if (isOverlapping) {
                const lastPos = lastValidPositionRef.current[element.id];
                if (lastPos) {
                    e.target.x(lastPos.x);
                    e.target.y(lastPos.y);
                }
            } else {
                lastValidPositionRef.current[element.id] = { x: newX, y: newY };
            }
        };
    };

    return { getDragMoveHandler };
};
