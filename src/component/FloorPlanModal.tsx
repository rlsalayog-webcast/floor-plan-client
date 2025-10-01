import { Button, Card, Form, Input, Modal, Radio, type FormProps } from "antd";
import { useCallback, useContext, useEffect, useState } from "react";
import { dummyElements } from "../constant/data";
import { DrawerVisibilityContext } from "../store/context/DrawerVisibilityContext";
import type { FloorPlanElement } from "../types/FloorPlan";
import CustomActionButtons from "./CustomActionButtons";
import FloorPlanEditor from "./floor-plan/FloorPlanEditor";

const { TextArea } = Input;

export type ISelect = "select" | "rectangle" | "circle" | "triangle";

interface FieldType {
    name: string;
    description: string;
}

const FloorPlanModal = () => {
    const { view, edit, id, dataSet } = useContext(DrawerVisibilityContext);
    const [selectedTool, setSelectedTool] = useState<ISelect>("select");
    const [form] = Form.useForm();

    const data = dataSet.value?.find((element: any) => element.id === id.value);

    useEffect(() => {
        dataSet.setValue(dummyElements);
    }, []);

    const onClose = () => {
        edit.setVisible(false);
        setSelectedTool("select");
        id.setValue(null);
    };

    const onFinish: FormProps<FieldType>["onFinish"] = useCallback(async (values: FieldType) => {
        console.log("values >> ", values);
        onClose();
    }, []);
    return (
        <Modal
            title="Landmark"
            width={1500}
            open={view.visible || edit.visible}
            onCancel={() => {
                onClose();
                view.setVisible(false);
            }}
            footer={null}
            destroyOnHidden // force re-mount to reset the states
        >
            <div className="grid grid-cols-3 gap-10">
                <FloorPlanEditor selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
                <div className="col-span-1 flex flex-col justify-between">
                    <div className="!space-y-6">
                        <CustomActionButtons
                            actions={view.visible && !edit.visible ? ["edit"] : []}
                            handleEdit={() => edit.setVisible(true)}
                            handleDelete={() => {
                                if (edit.visible) {
                                    dataSet.setValue((prev: FloorPlanElement[]) =>
                                        prev.filter((el: FloorPlanElement) => el.id !== id.value)
                                    );
                                }
                            }}
                        />
                        {edit.visible && (
                            <div className="flex gap-x-4">
                                <Radio.Group
                                    value={selectedTool}
                                    onChange={(e) => setSelectedTool(e.target.value)}
                                >
                                    <Radio.Button value="select">Select</Radio.Button>
                                    <Radio.Button value="rectangle">Floor</Radio.Button>
                                    {/* <Radio.Button value="circle">Circle</Radio.Button>
                                    <Radio.Button value="triangle">Triangle</Radio.Button> */}
                                </Radio.Group>
                                {/* <ColorPicker defaultValue="#1677ff" />
                                <ColorPicker defaultValue="#1677ff" /> */}
                            </div>
                        )}
                        <Card
                            title="Details"
                            extra={
                                <CustomActionButtons
                                    actions={edit.visible && id.value ? ["delete"] : []}
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
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={onFinish}
                                autoComplete="off"
                            >
                                <Form.Item
                                    label="Name"
                                    name="name"
                                    rules={[{ required: true, message: "Name is required" }]}
                                >
                                    <Input
                                        readOnly={!edit.visible || !Boolean(id.value)}
                                        allowClear
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="Description"
                                    name="description"
                                    rules={[{ required: true, message: "Description is required" }]}
                                >
                                    <TextArea
                                        rows={3}
                                        readOnly={!edit.visible || !Boolean(id.value)}
                                        allowClear
                                    />
                                </Form.Item>
                            </Form>
                        </Card>
                    </div>
                    {edit.visible && (
                        <div className="flex gap-4 justify-end">
                            <Button danger onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    form.submit();
                                }}
                            >
                                Save
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default FloorPlanModal;
