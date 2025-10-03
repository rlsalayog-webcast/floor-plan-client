import type { Transformer } from "konva/lib/shapes/Transformer";
import type { IFloorPlanArea } from "../../types/FloorPlan";

type UpdateElementAfterTransformParams = {
    transformerRef: React.RefObject<Transformer | null>;
    selectedElement: IFloorPlanArea;
    minSize?: { width: number; height: number };
};

/**
 * Calculates the new position and size of an element after a Konva Transformer finishes resizing, scaling, or moving it.
 * This function does NOT update state; it only returns the updated element.
 *
 * @param transformerRef  The Konva.Transformer ref controlling the element.
 * @param selectedElement The currently selected element being transformed.
 * @param minSize         Optional minimum width/height (default: { width: 20, height: 20 }).
 *
 * @returns The updated element with new x, y, width, and height.
 */

export const handleUpdateElementAfterTransform = ({
    transformerRef,
    selectedElement,
    minSize = { width: 20, height: 20 },
}: UpdateElementAfterTransformParams): IFloorPlanArea | undefined => {
    if (!selectedElement || !transformerRef.current) return;

    const node = transformerRef.current.nodes()[0];
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale to 1 and apply scale to dimensions
    node.scaleX(1);
    node.scaleY(1);

    const updatedElement: IFloorPlanArea = {
        ...selectedElement,
        x: node.x(),
        y: node.y(),
        width: Math.max(minSize.width, (selectedElement.width || minSize.width) * scaleX),
        height: Math.max(minSize.height, (selectedElement.height || minSize.height) * scaleY),
    };

    return updatedElement;
};
