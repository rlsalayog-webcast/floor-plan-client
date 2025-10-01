import { DownOutlined } from "@ant-design/icons";
import {
    Button,
    Card,
    Dropdown,
    Form,
    Input,
    Modal,
    Radio,
    Select,
    type FormProps,
    type MenuProps,
} from "antd";
import { useCallback, useContext, useEffect, useState } from "react";
import { dummyElements } from "../constant/data";
import DrawerVisibilityContext from "../store/context/DrawerVisibilityContext";
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
    const { modal, drawer } = useContext(DrawerVisibilityContext);
    const [selectedTool, setSelectedTool] = useState<ISelect>("select");
    const [form] = Form.useForm();
    const [floorLevel, setFloorLevel] = useState<string | undefined>("basement");

    const items: MenuProps["items"] = [
        {
            key: "1",
            label: "Create",
            onClick: () => {
                drawer.add.setVisible(true);
            },
        },
        {
            key: "2",
            label: "Edit",
            onClick: () => {
                drawer.edit.setVisible(true);
            },
        },
        {
            key: "3",
            label: "Delete",
            onClick: () => {},
        },
    ];

    const data = modal.dataSet.value?.find((element: any) => element.id === modal.id.value);

    useEffect(() => {
        modal.dataSet.setValue(dummyElements);
    }, []);

    const onClose = () => {
        modal.edit.setVisible(false);
        setSelectedTool("select");
        modal.id.setValue(null);
    };

    const onFinish: FormProps<FieldType>["onFinish"] = useCallback(async (values: FieldType) => {
        console.log("values >> ", values);
        onClose();
    }, []);

    return (
        <Modal
            title={"Floor Name"}
            width={1500}
            open={modal.view.visible || modal.edit.visible}
            onCancel={() => {
                onClose();
                modal.view.setVisible(false);
            }}
            footer={null}
            destroyOnHidden // force re-mount to reset the states
        >
            <div className="grid grid-cols-3 gap-10">
                <FloorPlanEditor selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
                <div className="col-span-1 flex flex-col justify-between">
                    <div className="!space-y-6">
                        <div className="flex gap-x-4">
                            <Select
                                placeholder="Floor Level"
                                style={{ width: 160 }}
                                allowClear
                                value={floorLevel}
                                onChange={(val) => setFloorLevel(val)}
                                options={[
                                    { value: "basement", label: "Basement" },
                                    { value: "ground", label: "Ground Floor" },
                                    { value: "first", label: "First Floor" },
                                ]}
                            />
                            <Dropdown menu={{ items }} placement="bottom">
                                <Button type="primary">
                                    Floor Actions
                                    <DownOutlined />
                                </Button>
                            </Dropdown>
                        </div>
                        <CustomActionButtons
                            actions={modal.view.visible && !modal.edit.visible ? ["edit"] : []}
                            handleEdit={() => modal.edit.setVisible(true)}
                            handleDelete={() => {
                                if (modal.edit.visible) {
                                    modal.dataSet.setValue((prev: FloorPlanElement[]) =>
                                        prev.filter(
                                            (el: FloorPlanElement) => el.id !== modal.id.value
                                        )
                                    );
                                }
                            }}
                        />
                        {modal.edit.visible && (
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
                                    actions={modal.edit.visible && modal.id.value ? ["delete"] : []}
                                    handleDelete={() => {
                                        if (modal.edit.visible) {
                                            modal.dataSet.setValue((prev: FloorPlanElement[]) =>
                                                prev.filter(
                                                    (el: FloorPlanElement) =>
                                                        el.id !== modal.id.value
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
                                        readOnly={!modal.edit.visible || !Boolean(modal.id.value)}
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
                                        readOnly={!modal.edit.visible || !Boolean(modal.id.value)}
                                        allowClear
                                    />
                                </Form.Item>
                            </Form>
                        </Card>
                    </div>
                    {modal.edit.visible && (
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
