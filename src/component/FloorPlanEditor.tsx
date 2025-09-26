import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import React, { useRef, useState } from "react";
import { Circle, Group, Layer, Line, Rect, Stage, Text } from "react-konva";
import { dummyElements } from "../constant/data";
import { getDragBoundFunc } from "../helper/floor-plan";
import { useDragWithCollision } from "../hook/useDragWithCollision";
import type { FloorPlanElement } from "../types/FloorPlan";

const FloorPlanEditor = () => {
    const [selectedElement, setSelectedElement] = useState<FloorPlanElement | null>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const [elements, setElements] = useState<FloorPlanElement[]>(dummyElements);
    const { getDragMoveHandler } = useDragWithCollision();

    const handleElementClick = (element: FloorPlanElement) => {
        console.log("element >> ", element);
        setSelectedElement(element);
    };

    const handleMouseOver = (e: KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        if (stage) {
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
            onMouseDown={(e) => {
                // deselect the shape when clicking on empty space
                if (e.target === e.target.getStage()) {
                    setSelectedElement(null);
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
                                    draggable
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
                                    onDragMove={getDragMoveHandler(element, elements)}
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
                                draggable
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
                                onDragMove={getDragMoveHandler(element, elements)}
                                dragBoundFunc={getDragBoundFunc(element, stageRef)}
                                onMouseOver={handleMouseOver}
                                onMouseOut={handleMouseOut}
                            >
                                <Circle
                                    radius={element.radius!}
                                    fill={isSelected ? "gray" : element.fill}
                                    stroke={"black"}
                                    strokeWidth={1}
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
