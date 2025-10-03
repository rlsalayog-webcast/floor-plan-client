import type Konva from "konva";
import type { IFloorPlanArea } from "../../types/FloorPlan";

/**
 * Keeps a draggable element (box) inside the stage boundaries while dragging.
 *
 * @param pos          The proposed position of the element ({ x, y }).
 * @param element      The element being dragged, containing width and height.
 * @param stage        The Konva.Stage instance to constrain the element within.
 * @param strokeWidth  Optional stroke width of the element (default is 1) to account for visual boundaries.
 * @returns            The adjusted position ({ x, y }) that keeps the element inside the stage.
 */

export const handleConstrainBoxToStageOnDrag = (
    pos: { x: number; y: number },
    element: IFloorPlanArea,
    stage: Konva.Stage,
    strokeWidth: number = 1
) => {
    const scale = stage.scaleX();
    const stageWidth = stage.width() / scale;
    const stageHeight = stage.height() / scale;
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
};
