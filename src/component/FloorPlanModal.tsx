import { Button, Card, Modal, Radio } from "antd";
import { useContext, useState } from "react";
import { dummyElements } from "../constant/data";
import { DrawerVisibilityContext } from "../store/context/DrawerVisibilityContext";
import type { FloorPlanElement } from "../types/FloorPlan";
import CustomActionButtons from "./CustomActionButtons";
import FloorPlanEditor from "./floor-plan/FloorPlanEditor";

export type ISelect = "select" | "rectangle" | "circle" | "triangle";

const FloorPlanModal = ({
    isEditDetailsVisible,
    setIsEditDetailsVisible,
}: {
    isEditDetailsVisible: boolean;
    setIsEditDetailsVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const { view, edit, id } = useContext(DrawerVisibilityContext);
    const [elements, setElements] = useState<FloorPlanElement[]>(dummyElements);
    const [selectedTool, setSelectedTool] = useState<ISelect>("select");

    const data = dummyElements.find((element: any) => element.id === id.value);

    return (
        <Modal
            title="Landmark"
            width={1500}
            open={view.visible}
            onCancel={() => view.setVisible(false)}
            footer={null}
        >
            <div className="grid grid-cols-3 gap-10">
                <FloorPlanEditor
                    elements={elements}
                    setElements={setElements}
                    selectedTool={selectedTool}
                    setSelectedTool={setSelectedTool}
                />
                <div className="col-span-1">
                    <div className="flex justify-between">
                        <CustomActionButtons
                            actions={edit.visible ? ["edit", "delete"] : ["edit"]}
                            handleEdit={() => edit.setVisible(true)}
                            handleDelete={() => {
                                if (edit.visible) {
                                    setElements((prev) =>
                                        prev.filter((el: any) => el.id !== id.value)
                                    );
                                }
                            }}
                        />
                        {edit.visible && (
                            <Button
                                onClick={() => {
                                    view.setVisible(true);
                                    edit.setVisible(false);
                                }}
                            >
                                Save
                            </Button>
                        )}
                    </div>
                    {edit.visible && (
                        <Radio.Group
                            value={selectedTool}
                            onChange={(e) => setSelectedTool(e.target.value)}
                        >
                            <Radio.Button value="select">Select</Radio.Button>
                            <Radio.Button value="rectangle">Rectangle</Radio.Button>
                            <Radio.Button value="circle">Circle</Radio.Button>
                            <Radio.Button value="triangle">Triangle</Radio.Button>
                        </Radio.Group>
                    )}
                    <Card
                        title="Details"
                        extra={
                            <CustomActionButtons
                                actions={edit.visible && id.value ? ["edit"] : []}
                                handleEdit={() => setIsEditDetailsVisible(true)}
                            />
                        }
                    >
                        <p>
                            Title: <span className="font-semibold">{data?.attributes.name}</span>
                        </p>
                        <p>Description: {data?.attributes.description}</p>
                    </Card>
                </div>
            </div>
        </Modal>
    );
};

export default FloorPlanModal;
