import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Box } from "konva/lib/shapes/Transformer";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Circle, Group, Layer, Rect, Stage, Text, Transformer } from "react-konva";
import { getDragBoundFunc } from "../../helper/floor-plan";
import useResponsiveStageSize from "../../hook/useResponsiveStageSize";
import { DrawerVisibilityContext } from "../../store/context/DrawerVisibilityContext";
import type { FloorPlanElement } from "../../types/FloorPlan";
import type { ISelect } from "../FloorPlanModal";
import GridLinesBg from "./GridLinesBg";

interface IFloorPlanEditor {
    selectedTool: ISelect;
    setSelectedTool: React.Dispatch<React.SetStateAction<ISelect>>;
}

const FloorPlanEditor = ({ selectedTool, setSelectedTool }: IFloorPlanEditor) => {
    const { edit, id, dataSet } = useContext(DrawerVisibilityContext);
    const { stageSize, containerRef } = useResponsiveStageSize();
    const [selectedElement, setSelectedElement] = useState<FloorPlanElement | null>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const elementRefs = useRef(new Map());
    const transformerRef = useRef<Konva.Transformer>(null);

    // Used for transformer / resizing
    useEffect(() => {
        if (selectedElement && transformerRef.current) {
            const stage = stageRef.current;
            if (stage) {
                const node = stage.findOne(`#element-${selectedElement.id}`);
                if (node) {
                    transformerRef.current.nodes([node]);
                    transformerRef.current.getLayer()?.batchDraw();
                }
            }
        } else if (transformerRef.current) {
            transformerRef.current.nodes([]);
        }
    }, [selectedElement]);

    const bringToFront = (elementId: string) => {
        dataSet.setValue((prev: FloorPlanElement[]) => {
            const elementIndex = prev.findIndex((el) => el.id === elementId);
            if (elementIndex === -1) {
                return prev;
            }

            const newArray = [...prev];
            const [element] = newArray.splice(elementIndex, 1);
            newArray.push(element);

            return newArray;
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

        if (selectedTool !== "select") {
            const newElement: FloorPlanElement = {
                id: `element-${Date.now()}`,
                type: selectedTool,
                x: position.x,
                y: position.y,
                width: selectedTool === "rectangle" ? 100 : undefined,
                height: selectedTool === "rectangle" ? 80 : undefined,
                radius: selectedTool === "circle" ? 40 : undefined,
                backgroundColor: "#1677ff",
                textColor: "#ffffff",
                attributes: {
                    name: `${selectedTool} ${dataSet.value.length + 1}`,
                    description: `A ${selectedTool} element`,
                },
            };

            dataSet.setValue((prev: FloorPlanElement[]) => [...prev, newElement]);
            setSelectedTool("select");
        }
    };

    const handleElementClick = (element: FloorPlanElement) => {
        id.setValue(element.id);
        setSelectedElement(element);
        bringToFront(element.id);
    };

    const handleOnDragEnd = (e: KonvaEventObject<DragEvent>, element: FloorPlanElement) => {
        const updatedElements = dataSet.value.map((el: FloorPlanElement) =>
            el.id === element.id
                ? {
                      ...el,
                      x: e.target.x(),
                      y: e.target.y(),
                  }
                : el
        );
        dataSet.setValue(updatedElements);
    };

    const handleMouseOver = (e: KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        if (stage && edit.visible) {
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
        if (!selectedElement || !transformerRef.current) return;

        const node = transformerRef.current.nodes()[0];
        if (!node) return;

        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        // Reset scale to 1 and update actual dimensions
        node.scaleX(1);
        node.scaleY(1);

        let updatedElement = { ...selectedElement };

        if (selectedElement.type === "rectangle") {
            updatedElement = {
                ...selectedElement,
                x: node.x(),
                y: node.y(),
                width: Math.max(20, (selectedElement.width || 100) * scaleX),
                height: Math.max(20, (selectedElement.height || 80) * scaleY),
            };
        } else if (selectedElement.type === "circle") {
            updatedElement = {
                ...selectedElement,
                x: node.x(),
                y: node.y(),
                radius: Math.max(10, (selectedElement.radius || 40) * Math.max(scaleX, scaleY)),
            };
        }

        // Update the element in the dataset
        const updatedElements = dataSet.value.map((el: FloorPlanElement) =>
            el.id === selectedElement.id ? updatedElement : el
        );
        dataSet.setValue(updatedElements);
        setSelectedElement(updatedElement);
    };

    const boundBoxFunc = (oldBox: Box, newBox: Box) => {
        // Prevent resizing below minimum sizes
        if (newBox.width < 20 || newBox.height < 20) {
            return oldBox;
        }

        // --- Detect if we are working with a circle ---
        // To stop resizing circle if it reached the max height of stage
        const isCircle = selectedElement?.type === "circle";

        if (isCircle) {
            // 🔑 Keep the box square by locking aspect ratio
            const size = Math.max(newBox.width, newBox.height); // take the larger dimension
            newBox.width = size;
            newBox.height = size;
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
            if (isCircle) {
                return oldBox;
            }
            newBox.width = stageSize.width - newBox.x;
        }
        if (newBox.y + newBox.height > stageSize.height) {
            if (isCircle) {
                return oldBox;
            }
            newBox.height = stageSize.height - newBox.y;
        }

        // Final size check after boundary adjustments
        if (newBox.width < 20 || newBox.height < 20) {
            return oldBox;
        }

        return newBox;
    };

    return (
        <div ref={containerRef} className="col-span-2">
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
                        setSelectedElement(null);
                        id.setValue(null);
                    }
                }}
            >
                <Layer>
                    <GridLinesBg width={1000} height={520} cellSize={25} />
                    {dataSet.value?.map((element: FloorPlanElement) => {
                        const isSelected = selectedElement?.id === element.id;

                        if (element.type === "rectangle" || element.type === "circle") {
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
                                    draggable={edit.visible}
                                    onClick={() => handleElementClick(element)}
                                    onDragStart={() => bringToFront(element.id)}
                                    onDragEnd={(e) => handleOnDragEnd(e, element)}
                                    onDragMove={(e) => {
                                        handleElementClick(element);
                                        // getDragMoveHandler(e, element, elements);
                                    }}
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
                                    {element.type === "rectangle" ? (
                                        <>
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
                                                text={element.attributes.name}
                                                fontSize={12}
                                                fill={element.textColor}
                                                align="center"
                                                verticalAlign="middle"
                                                width={element.width ?? 20}
                                                height={element.height ?? 20}
                                            />
                                        </>
                                    ) : element.type === "circle" ? (
                                        <>
                                            <Circle
                                                radius={element.radius!}
                                                fill={element.backgroundColor}
                                                opacity={isSelected ? 0.7 : 1}
                                                stroke={"black"}
                                                strokeWidth={1}
                                                strokeScaleEnabled={false}
                                            />
                                            <Text
                                                text={element.attributes.name}
                                                fontSize={12}
                                                fill={element.textColor}
                                                align="center"
                                                verticalAlign="middle"
                                                width={element.radius ? element.radius * 2 : 40}
                                                height={element.radius ? element.radius * 2 : 40}
                                                offsetX={element.radius ? element.radius : 20}
                                                offsetY={element.radius ? element.radius : 20}
                                            />
                                        </>
                                    ) : null}
                                </Group>
                            );
                        }
                        return null;
                    })}

                    {/* FIXED: Single Transformer outside the map loop */}
                    {selectedElement && edit.visible && (
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
