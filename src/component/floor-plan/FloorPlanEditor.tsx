import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { useContext, useEffect, useRef } from "react";
import { Group, Layer, Rect, Stage, Text, Transformer } from "react-konva";
import { TEMP_ID_FORMAT } from "../../constant";
import { handleConstrainBoxToStageOnDrag } from "../../helper/floor-plan/handleConstrainBoxToStageOnDrag";
import { handleKeepResizeWithinStage } from "../../helper/floor-plan/handleKeepResizeWithinStage";
import { handleUpdateElementAfterTransform } from "../../helper/floor-plan/handleUpdateElementAfterTransform";
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
    const STROKE_WIDTH = 1; // border width for elements
    const { modal } = useContext(DrawerVisibilityContext);
    const { stageSize, containerRef } = useResponsiveStageSize();
    const stageRef = useRef<Konva.Stage>(null);
    const elementRefs = useRef(new Map());
    const transformerRef = useRef<Konva.Transformer>(null);

    // Update transformer when selected area changes for resizing
    useEffect(() => {
        if (modal.selectedArea.value && transformerRef.current) {
            const stage = stageRef.current;
            if (stage) {
                const node = stage.findOne(`#${TEMP_ID_FORMAT}${modal.selectedArea.value.id}`);
                if (node) {
                    transformerRef.current.nodes([node]);
                    transformerRef.current.getLayer()?.batchDraw();
                }
            }
        } else if (transformerRef.current) {
            transformerRef.current.nodes([]);
        }
    }, [modal.selectedArea.value]);

    const moveAreaToFront = (elementId: string) => {
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
     * To add new areas on stage click
     */
    const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
        const position = e.target.getStage()?.getPointerPosition();

        if (!position) {
            return;
        }

        if (modal.selectedTool.value !== "select") {
            const newElement: IFloorPlanArea = {
                id: `${TEMP_ID_FORMAT}${Date.now()}`,
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
        moveAreaToFront(element.id);
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
                                id={`${TEMP_ID_FORMAT}${element.id}`}
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

                                    return handleConstrainBoxToStageOnDrag(
                                        pos,
                                        element,
                                        stage,
                                        STROKE_WIDTH
                                    );
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
                                    strokeWidth={STROKE_WIDTH}
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
                            boundBoxFunc={(oldBox, newBox) =>
                                handleKeepResizeWithinStage(oldBox, newBox, {
                                    width: stageSize.width,
                                    height: stageSize.height,
                                })
                            }
                            onTransformEnd={() => {
                                if (!modal.selectedArea.value) {
                                    return;
                                }

                                const updatedElement = handleUpdateElementAfterTransform({
                                    transformerRef,
                                    selectedElement: modal.selectedArea.value,
                                });

                                if (updatedElement) {
                                    modal.dataSet.setValue((prev: IFloor) => ({
                                        ...prev,
                                        areas: prev.areas?.map((el) =>
                                            el.id === updatedElement.id ? updatedElement : el
                                        ),
                                    }));

                                    modal.selectedArea.setValue(updatedElement);
                                }
                            }}
                        />
                    )}
                </Layer>
            </Stage>
        </div>
    );
};

export default FloorPlanEditor;
