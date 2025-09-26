import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import React, { useContext, useRef, useState } from "react";
import { Circle, Group, Layer, Line, Rect, Stage, Text } from "react-konva";
import { getDragBoundFunc } from "../helper/floor-plan";
import { useDragWithCollision } from "../hook/useDragWithCollision";
import { DrawerVisibilityContext } from "../store/context/DrawerVisibilityContext";
import type { FloorPlanElement } from "../types/FloorPlan";
import type { ISelect } from "./LandmarkDetailsModal";

const FloorPlanEditor = ({
    elements,
    setElements,
    selectedTool,
    setSelectedTool,
}: {
    elements: FloorPlanElement[];
    setElements: React.Dispatch<React.SetStateAction<FloorPlanElement[]>>;
    selectedTool: ISelect;
    setSelectedTool: React.Dispatch<React.SetStateAction<ISelect>>;
}) => {
    const { edit, id } = useContext(DrawerVisibilityContext);
    const [selectedElement, setSelectedElement] = useState<FloorPlanElement | null>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const { getDragMoveHandler } = useDragWithCollision();

    /**
     * To add new shapes
     */
    const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        const pos = stage?.getPointerPosition();

        if (!pos) return;

        if (selectedTool !== "select") {
            const newElement: FloorPlanElement = {
                id: `element-${Date.now()}`,
                type: selectedTool,
                x: pos.x,
                y: pos.y,
                width: selectedTool === "rectangle" ? 100 : undefined,
                height: selectedTool === "rectangle" ? 80 : undefined,
                radius: selectedTool === "circle" ? 50 : undefined,
                fill: "#00bcd4",
                attributes: {
                    name: `${selectedTool} ${elements.length + 1}`,
                    description: `A ${selectedTool} element`,
                },
            };

            setElements([...elements, newElement]);
            setSelectedTool("select");
        }
    };

    const handleElementClick = (element: FloorPlanElement) => {
        id.setValue(element.id);
        setSelectedElement(element);
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

    return (
        <Stage
            ref={stageRef}
            width={1000}
            height={520}
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
                {/* Grid lines */}
                {Array.from({ length: 50 }, (_, i) => (
                    <React.Fragment key={`grid-${i}`}>
                        <Line
                            points={[i * 40, 0, i * 40, 2000]}
                            stroke="hsl(var(--grid-color))"
                            strokeWidth={0.5}
                            opacity={0.3}
                        />
                        <Line
                            points={[0, i * 40, 2000, i * 40]}
                            stroke="hsl(var(--grid-color))"
                            strokeWidth={0.5}
                            opacity={0.3}
                        />
                    </React.Fragment>
                ))}

                {/* Floor plan elements */}
                {elements.map((element) => {
                    const isSelected = selectedElement?.id === element.id;

                    if (element.type === "rectangle") {
                        return (
                            <React.Fragment key={element.id}>
                                <Group
                                    x={element.x}
                                    y={element.y}
                                    draggable={edit.visible}
                                    onClick={() => handleElementClick(element)}
                                    onDragEnd={(e) => {
                                        const updatedElements = elements.map((el) =>
                                            el.id === element.id
                                                ? {
                                                      ...el,
                                                      x: e.target.x(),
                                                      y: e.target.y(),
                                                  }
                                                : el
                                        );
                                        setElements(updatedElements);
                                    }}
                                    onDragMove={(e) => {
                                        handleElementClick(element);
                                        getDragMoveHandler(element, elements)(e);
                                    }}
                                    dragBoundFunc={getDragBoundFunc(element, stageRef)}
                                    onMouseOver={handleMouseOver}
                                    onMouseOut={handleMouseOut}
                                >
                                    <Rect
                                        width={element.width!}
                                        height={element.height!}
                                        fill={isSelected ? "gray" : element.fill}
                                        stroke={"black"}
                                        strokeWidth={1}
                                        strokeScaleEnabled={false}
                                    />
                                    <Text
                                        align="center"
                                        verticalAlign="middle"
                                        width={element.width ?? 20}
                                        height={element.height ?? 20}
                                        text={element.attributes.name}
                                        fontSize={12}
                                        fill="red"
                                    />
                                </Group>
                            </React.Fragment>
                        );
                    }

                    if (element.type === "circle") {
                        return (
                            <Group
                                key={element.id}
                                x={element.x}
                                y={element.y}
                                draggable={edit.visible}
                                onClick={() => handleElementClick(element)}
                                onDragEnd={(e) => {
                                    const updatedElements = elements.map((el) =>
                                        el.id === element.id
                                            ? {
                                                  ...el,
                                                  x: e.target.x(),
                                                  y: e.target.y(),
                                              }
                                            : el
                                    );
                                    setElements(updatedElements);
                                }}
                                onDragMove={(e) => {
                                    handleElementClick(element);
                                    getDragMoveHandler(element, elements)(e);
                                }}
                                dragBoundFunc={getDragBoundFunc(element, stageRef)}
                                onMouseOver={handleMouseOver}
                                onMouseOut={handleMouseOut}
                            >
                                <Circle
                                    radius={element.radius!}
                                    fill={isSelected ? "gray" : element.fill}
                                    stroke={"black"}
                                    strokeWidth={1}
                                    strokeScaleEnabled={false}
                                />
                                <Text
                                    text={element.attributes.name}
                                    fontSize={12}
                                    fill="blue"
                                    align="center"
                                    verticalAlign="middle"
                                    width={element.radius ? element.radius * 2 : 40}
                                    height={element.radius ? element.radius * 2 : 40}
                                    offsetX={element.radius ? element.radius : 20}
                                    offsetY={element.radius ? element.radius : 20}
                                />
                            </Group>
                        );
                    }

                    return null;
                })}
            </Layer>
        </Stage>
    );
};

export default FloorPlanEditor;
