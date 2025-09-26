import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import React, { useContext, useRef, useState } from "react";
import { Circle, Group, Layer, Rect, Stage, Text } from "react-konva";
import { getDragBoundFunc } from "../../helper/floor-plan";
import { useDragWithCollision } from "../../hook/useDragWithCollision";
import { DrawerVisibilityContext } from "../../store/context/DrawerVisibilityContext";
import type { FloorPlanElement } from "../../types/FloorPlan";
import type { ISelect } from "../FloorPlanModal";
import GridLinesBg from "./GridLinesBg";

interface IFloorPlanEditor {
    elements: FloorPlanElement[];
    setElements: React.Dispatch<React.SetStateAction<FloorPlanElement[]>>;
    selectedTool: ISelect;
    setSelectedTool: React.Dispatch<React.SetStateAction<ISelect>>;
}

const FloorPlanEditor = ({
    elements,
    setElements,
    selectedTool,
    setSelectedTool,
}: IFloorPlanEditor) => {
    const { edit, id } = useContext(DrawerVisibilityContext);
    const { getDragMoveHandler } = useDragWithCollision();
    const stageRef = useRef<Konva.Stage>(null);
    const [selectedElement, setSelectedElement] = useState<FloorPlanElement | null>(null);

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

    const handleOnDragEnd = (e: KonvaEventObject<DragEvent>, element: FloorPlanElement) => {
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
                <GridLinesBg width={1000} height={520} cellSize={25} />
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
                                    onDragEnd={(e) => handleOnDragEnd(e, element)}
                                    onDragMove={(e) => {
                                        handleElementClick(element);
                                        getDragMoveHandler(e, element, elements);
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
                                onDragEnd={(e) => handleOnDragEnd(e, element)}
                                onDragMove={(e) => {
                                    handleElementClick(element);
                                    getDragMoveHandler(e, element, elements);
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
