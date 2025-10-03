import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Box } from "konva/lib/shapes/Transformer";
import { useContext, useEffect, useRef } from "react";
import { Group, Layer, Rect, Stage, Text, Transformer } from "react-konva";
import { getDragBoundFunc } from "../../helper/floor-plan";
import useResponsiveStageSize from "../../hook/useResponsiveStageSize";
import DrawerVisibilityContext from "../../store/context/DrawerVisibilityContext";
import type { IFloor, IFloorPlanArea } from "../../types/FloorPlan";
import GridLinesBg from "./GridLinesBg";

const FloorPlanEditor = ({
    handleAreaClick,
    handleStageOpenAreaClick,
}: {
    handleAreaClick: (area: IFloorPlanArea) => void;
    handleStageOpenAreaClick: () => void;
}) => {
    const { modal } = useContext(DrawerVisibilityContext);
    const { stageSize, containerRef } = useResponsiveStageSize();
    const stageRef = useRef<Konva.Stage>(null);
    const elementRefs = useRef(new Map());
    const transformerRef = useRef<Konva.Transformer>(null);

    // Used for transformer / resizing
    useEffect(() => {
        if (modal.selectedArea.value && transformerRef.current) {
            const stage = stageRef.current;
            if (stage) {
                const node = stage.findOne(`#element-${modal.selectedArea.value.id}`);
                if (node) {
                    transformerRef.current.nodes([node]);
                    transformerRef.current.getLayer()?.batchDraw();
                }
            }
        } else if (transformerRef.current) {
            transformerRef.current.nodes([]);
        }
    }, [modal.selectedArea.value]);

    const bringToFront = (elementId: string) => {
        modal.dataSet.setValue((prev: IFloor) => {
            if (!prev.areas) return prev;

            const elementIndex = prev.areas.findIndex((el) => el.id === elementId);
            if (elementIndex === -1) {
                return prev;
            }

            const newAreas = [...prev.areas];
            const [element] = newAreas.splice(elementIndex, 1);
            newAreas.push(element);

            return {
                ...prev,
                areas: newAreas,
            };
        });
    };

    /**
     * To add new shapes
     */
    const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
        const position = e.target.getStage()?.getPointerPosition();

        if (!position) {
            return;
        }

        if (modal.selectedTool.value !== "select") {
            const newElement: IFloorPlanArea = {
                id: `element-${Date.now()}`,
                x: position.x,
                y: position.y,
                width: 100,
                height: 80,
                backgroundColor: "#1677ff",
                textColor: "#ffffff",
                details: {
                    name: `${modal.selectedTool.value} ${modal.dataSet.value.areas.length + 1}`,
                    description: `A ${modal.selectedTool.value} element`,
                },
            };

            modal.dataSet.setValue((prev: IFloor) => ({
                ...prev,
                areas: [...(prev.areas ?? []), newElement],
            }));
            modal.selectedTool.setValue("select");
        }
    };

    const handleElementClick = (element: IFloorPlanArea) => {
        modal.selectedArea.setValue(element);
        bringToFront(element.id);
        handleAreaClick(element);
    };

    const handleOnDragEnd = (e: KonvaEventObject<DragEvent>, element: IFloorPlanArea) => {
        const updatedAreas = modal.dataSet.value.areas?.map((el: IFloorPlanArea) =>
            el.id === element.id
                ? {
                      ...el,
                      x: e.target.x(),
                      y: e.target.y(),
                  }
                : el
        );

        modal.dataSet.setValue((prev: IFloor) => ({
            ...prev,
            areas: updatedAreas,
        }));
    };

    const handleMouseOver = (e: KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        if (stage && modal.edit.visible) {
            stage.container().style.cursor = "move";
        }
    };

    const handleMouseOut = (e: KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        if (stage) {
            stage.container().style.cursor = "default";
        }
    };

    // NEW: Handle transform end to update element dimensions
    const handleTransformEnd = () => {
        if (!modal.selectedArea.value || !transformerRef.current) return;

        const node = transformerRef.current.nodes()[0];
        if (!node) return;

        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        // Reset scale to 1 and update actual dimensions
        node.scaleX(1);
        node.scaleY(1);

        let updatedElement = { ...modal.selectedArea.value };

        updatedElement = {
            ...modal.selectedArea.value,
            x: node.x(),
            y: node.y(),
            width: Math.max(20, (modal.selectedArea.value.width || 100) * scaleX),
            height: Math.max(20, (modal.selectedArea.value.height || 80) * scaleY),
        };

        // Update the element in the dataset
        const updatedElements = modal.dataSet.value.areas?.map((el: IFloorPlanArea) =>
            el.id === modal.selectedArea.value.id ? updatedElement : el
        );
        modal.dataSet.setValue((prev: IFloor) => ({ ...prev, areas: updatedElements }));
        modal.selectedArea.setValue(updatedElement);
    };

    const boundBoxFunc = (oldBox: Box, newBox: Box) => {
        // Prevent resizing below minimum sizes
        if (newBox.width < 20 || newBox.height < 20) {
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
        if (newBox.width < 20 || newBox.height < 20) {
            return oldBox;
        }

        return newBox;
    };

    return (
        <div ref={containerRef}>
            <Stage
                ref={stageRef}
                width={stageSize.width}
                height={stageSize.height}
                scaleX={stageSize.scale}
                scaleY={stageSize.scale}
                onClick={handleStageClick}
                onMouseDown={(e) => {
                    // deselect the shape when clicking on empty space
                    if (e.target === e.target.getStage()) {
                        handleStageOpenAreaClick();
                    }
                }}
            >
                <Layer>
                    <GridLinesBg width={1000} height={520} cellSize={25} />
                    {modal.dataSet.value?.areas?.map((element: IFloorPlanArea) => {
                        const isSelected = modal.selectedArea.value?.id === element.id;
                        return (
                            <Group
                                key={element.id}
                                id={`element-${element.id}`}
                                ref={(node) => {
                                    if (node) {
                                        elementRefs.current.set(element.id, node);
                                    } else {
                                        elementRefs.current.delete(element.id);
                                    }
                                }}
                                x={element.x}
                                y={element.y}
                                draggable={modal.edit.visible}
                                onClick={() => handleElementClick(element)}
                                onDragStart={() => handleElementClick(element)}
                                onDragEnd={(e) => handleOnDragEnd(e, element)}
                                dragBoundFunc={(pos) => {
                                    const stage = stageRef.current;

                                    if (!stage) {
                                        return pos;
                                    }

                                    return getDragBoundFunc(pos, element, stage);
                                }}
                                onMouseOver={handleMouseOver}
                                onMouseOut={handleMouseOut}
                            >
                                <Rect
                                    width={element.width!}
                                    height={element.height!}
                                    fill={element.backgroundColor}
                                    opacity={isSelected ? 0.7 : 1}
                                    stroke={"black"}
                                    strokeWidth={1}
                                    strokeScaleEnabled={false}
                                />
                                <Text
                                    text={element.details?.name}
                                    fontSize={12}
                                    fill={element.textColor}
                                    align="center"
                                    verticalAlign="middle"
                                    width={element.width ?? 20}
                                    height={element.height ?? 20}
                                />
                            </Group>
                        );
                    })}

                    {modal.selectedArea.value && modal.edit.visible && (
                        <Transformer
                            ref={transformerRef}
                            boundBoxFunc={boundBoxFunc}
                            onTransformEnd={handleTransformEnd}
                        />
                    )}
                </Layer>
            </Stage>
        </div>
    );
};

export default FloorPlanEditor;
