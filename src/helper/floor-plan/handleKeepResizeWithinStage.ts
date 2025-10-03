import type { Box } from "konva/lib/shapes/Transformer";

type StageSize = {
    width: number;
    height: number;
};

type MinSize = {
    width: number;
    height: number;
};

/**
 * Keep an element (box) within the stage boundaries while resizing.
 *
 * @param oldBox   The previous dimensions and position of the element.
 * @param newBox   The proposed new dimensions and position of the element.
 * @param stageSize The size of the stage (width and height) to constrain the element.
 * @param minSize  Optional minimum width and height for the element (default: { width: 20, height: 20 }).
 * @returns        The adjusted box that stays within the stage and respects minimum size constraints.
 */

export const handleKeepResizeWithinStage = (
    oldBox: Box,
    newBox: Box,
    stageSize: StageSize,
    minSize: MinSize = { width: 20, height: 20 }
) => {
    // Prevent resizing below minimum sizes
    if (newBox.width < minSize.width || newBox.height < minSize.height) {
        return oldBox;
    }

    // Ensure the shape stays within stage boundaries
    if (newBox.x < 0) {
        newBox.width += newBox.x;
        newBox.x = 0;
    }
    if (newBox.y < 0) {
        newBox.height += newBox.y;
        newBox.y = 0;
    }
    if (newBox.x + newBox.width > stageSize.width) {
        newBox.width = stageSize.width - newBox.x;
    }
    if (newBox.y + newBox.height > stageSize.height) {
        newBox.height = stageSize.height - newBox.y;
    }

    // Final size check after boundary adjustments
    if (newBox.width < minSize.width || newBox.height < minSize.height) {
        return oldBox;
    }

    return newBox;
};
