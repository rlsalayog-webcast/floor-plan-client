import { Button, Card, Modal, Radio } from "antd";
import { useContext, useEffect, useState } from "react";
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
    const { view, edit, id, dataSet } = useContext(DrawerVisibilityContext);
    const [selectedTool, setSelectedTool] = useState<ISelect>("select");

    const data = dataSet.value?.find((element: any) => element.id === id.value);

    useEffect(() => {
        dataSet.setValue(dummyElements);
    }, []);

    const onClose = () => {
        view.setVisible(false);
        edit.setVisible(false);
        setSelectedTool("select");
        id.setValue(null);
    };

    return (
        <Modal
            title="Landmark"
            width={1500}
            open={view.visible || edit.visible}
            onCancel={onClose}
            footer={null}
            destroyOnHidden // force re-mount to reset the states
        >
            <div className="grid grid-cols-3 gap-10">
                <FloorPlanEditor selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
                <div className="col-span-1 flex flex-col justify-between">
                    <div className="!space-y-6">
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
                                    actions={edit.visible && id.value ? ["edit", "delete"] : []}
                                    handleEdit={() => setIsEditDetailsVisible(true)}
                                    handleDelete={() => {
                                        if (edit.visible) {
                                            dataSet.setValue((prev: FloorPlanElement[]) =>
                                                prev.filter(
                                                    (el: FloorPlanElement) => el.id !== id.value
                                                )
                                            );
                                        }
                                    }}
                                />
                            }
                        >
                            <p>
                                Title:{" "}
                                <span className="font-semibold">{data?.attributes.name}</span>
                            </p>
                            <p>Description: {data?.attributes.description}</p>
                        </Card>
                    </div>
                    {edit.visible && (
                        <div className="flex gap-4 justify-end">
                            <Button danger onClick={onClose}>
                                Cancel
                            </Button>
                            <Button onClick={onClose}>Save</Button>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default FloorPlanModal;
