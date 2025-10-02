import { DownOutlined } from "@ant-design/icons";
import {
    Button,
    Card,
    Dropdown,
    Form,
    Input,
    message,
    Modal,
    Radio,
    Select,
    Spin,
    type FormProps,
    type MenuProps,
} from "antd";
import { useCallback, useContext, useEffect, useState } from "react";
import { useGetFloorByLevelId } from "../api/hooks/useGetFloorByLevel";
import { useGetLandmarkById } from "../api/hooks/useGetLandmarkById";
import DrawerVisibilityContext from "../store/context/DrawerVisibilityContext";
import type { IFloor, IFloorPlanArea } from "../types/FloorPlan";
import CustomActionButtons from "./CustomActionButtons";
import FloorPlanEditor from "./floor-plan/FloorPlanEditor";

const { TextArea } = Input;

interface FieldType {
    name: string;
    description: string;
}

interface FloorOption {
    value: string;
    label: string;
}

const FloorPlanModal = () => {
    const [messageApi, contextHolderMessage] = message.useMessage();
    const { handleGetLandmarkById, loading: loadingGetLandmarkById } = useGetLandmarkById();
    const { handleGetFloorByLevelId, loading: loadingGetFloorByLevelId } = useGetFloorByLevelId();
    const { modal, drawer } = useContext(DrawerVisibilityContext);
    const [form] = Form.useForm();
    const [floorLevel, setFloorLevel] = useState<string | undefined>("");
    const [floorOptions, setFloorOptions] = useState<FloorOption[]>([]);

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

    useEffect(() => {
        const fetch = async () => {
            if (modal.id.value && modal.view.visible) {
                try {
                    const resp = await handleGetLandmarkById(modal.id.value);
                    if (resp) {
                        const options = resp.data.getLandmarkById.floorPlans.map(
                            ({ id, level }: any) => ({
                                value: id,
                                label: level,
                            })
                        );
                        setFloorOptions(options ?? []);
                        if (options.length > 0) {
                            setFloorLevel(options[0].value);

                            const resp = await handleGetFloorByLevelId({
                                landmarkId: modal.id.value,
                                levelId: options[0].value,
                            });

                            if (resp) {
                                modal.dataSet.setValue(resp.data.getFloorByLevelId);
                            }
                        }
                    }
                } catch (err) {
                    messageApi.open({
                        type: "error",
                        content: "Failed to get Landmark!",
                    });
                } finally {
                }
            }
        };
        fetch();
    }, [modal.id.value, modal.view.visible]);

    const onChangeSelect = useCallback(
        async (val: any) => {
            if (!val) return;

            setFloorLevel(val);

            if (modal.id.value) {
                const resp = await handleGetFloorByLevelId({
                    landmarkId: modal.id.value,
                    levelId: val,
                });

                if (resp) {
                    modal.dataSet.setValue(resp.data.getFloorByLevelId);
                }
            }
        },
        [modal.id.value]
    );

    const onClose = () => {
        modal.edit.setVisible(false);
        modal.id.setValue(null);
        modal.selectedTool.setValue("select");
    };

    const onFinish: FormProps<FieldType>["onFinish"] = useCallback(async (values: FieldType) => {
        console.log("values >> ", values);
        onClose();
    }, []);

    const loading = loadingGetLandmarkById || loadingGetFloorByLevelId;

    return (
        <>
            {contextHolderMessage}
            <Modal
                title={modal.dataSet.value?.name ?? ""}
                width={1500}
                zIndex={500}
                open={modal.view.visible || modal.edit.visible}
                onCancel={() => {
                    onClose();
                    modal.view.setVisible(false);
                }}
                footer={null}
                destroyOnHidden // force re-mount to reset the states
            >
                {loading && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            minHeight: "400px",
                        }}
                    >
                        <Spin />
                    </div>
                )}

                {!loading && (
                    <div className="grid grid-cols-3 gap-10">
                        <FloorPlanEditor />
                        <div className="col-span-1 flex flex-col justify-between">
                            <div className="!space-y-6">
                                <div className="flex gap-x-4">
                                    <Select
                                        placeholder="Floor Level"
                                        style={{ width: 160 }}
                                        value={floorLevel}
                                        onChange={onChangeSelect}
                                        options={floorOptions}
                                    />
                                    <Dropdown menu={{ items }} placement="bottom">
                                        <Button type="primary">
                                            Floor Actions
                                            <DownOutlined />
                                        </Button>
                                    </Dropdown>
                                </div>
                                <CustomActionButtons
                                    actions={
                                        modal.view.visible && !modal.edit.visible ? ["edit"] : []
                                    }
                                    handleEdit={() => modal.edit.setVisible(true)}
                                />
                                {modal.edit.visible && (
                                    <div className="flex gap-x-4">
                                        <Radio.Group
                                            value={modal.selectedTool.value}
                                            onChange={(e) =>
                                                modal.selectedTool.setValue(e.target.value)
                                            }
                                        >
                                            <Radio.Button value="select">Select</Radio.Button>
                                            <Radio.Button value="area">Floor</Radio.Button>
                                        </Radio.Group>
                                        {/* <ColorPicker defaultValue="#1677ff" />
                                            <ColorPicker defaultValue="#1677ff" /> */}
                                    </div>
                                )}
                                <Card
                                    title="Details"
                                    extra={
                                        <CustomActionButtons
                                            actions={
                                                modal.edit.visible && modal.selectedArea.value
                                                    ? ["delete"]
                                                    : []
                                            }
                                            handleDelete={() => {
                                                if (modal.edit.visible) {
                                                    modal.dataSet.setValue((prev: IFloor) => ({
                                                        ...prev,
                                                        areas: prev.areas?.filter(
                                                            (el: IFloorPlanArea) =>
                                                                el.id !==
                                                                modal.selectedArea.value.id
                                                        ),
                                                    }));
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
                                            rules={[
                                                { required: true, message: "Name is required" },
                                            ]}
                                        >
                                            <Input
                                                readOnly={
                                                    !modal.edit.visible ||
                                                    !Boolean(modal.selectedArea.value)
                                                }
                                                allowClear
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label="Description"
                                            name="description"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "Description is required",
                                                },
                                            ]}
                                        >
                                            <TextArea
                                                rows={3}
                                                readOnly={
                                                    !modal.edit.visible ||
                                                    !Boolean(modal.selectedArea.value)
                                                }
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
                )}
            </Modal>
        </>
    );
};

export default FloorPlanModal;
