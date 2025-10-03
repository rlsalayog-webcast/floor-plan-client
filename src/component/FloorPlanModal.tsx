import { CheckCircleFilled, DownOutlined } from "@ant-design/icons";
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
import { useDeleteFloor } from "../api/hooks/useDeleteFloor";
import { useGetFloorByLevelId } from "../api/hooks/useGetFloorByLevel";
import { useGetLandmarkById } from "../api/hooks/useGetLandmarkById";
import { useUpdateFloorAreas } from "../api/hooks/useUpdateFloorAreas";
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
    const [modalAntd, contextHolderModal] = Modal.useModal();
    const { handleGetLandmarkById, loading: loadingGetLandmarkById } = useGetLandmarkById();
    const { handleGetFloorByLevelId, loading: loadingGetFloorByLevelId } = useGetFloorByLevelId();
    const { handleUpdateFloorAreas, loading: loadingUpdateFloorAreas } = useUpdateFloorAreas();
    const { handleDeleteFloor } = useDeleteFloor();
    const { modal, drawer } = useContext(DrawerVisibilityContext);
    const [form] = Form.useForm();
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
            onClick: () => {
                modalAntd.confirm({
                    title: "Confirm Deletion",
                    content: (
                        <>
                            <p>Are you sure you want to delete this floor?</p>
                            <p>This action cannot be undone.</p>
                        </>
                    ),
                    onOk: async () => {
                        try {
                            if (!modal.id.value) {
                                return;
                            }

                            const resp = await handleDeleteFloor({
                                landmarkId: modal.id.value,
                                id: modal.dataSet.value?.id,
                            });

                            if (!resp) {
                                throw new Error("Failed to delete Floor!");
                            }

                            messageApi.open({
                                type: "success",
                                icon: <CheckCircleFilled />,
                                content: "Floor was deleted successfully!",
                            });
                            drawer.refetch.setValue((prev) => !prev);
                            return;
                        } catch (error) {
                            messageApi.open({
                                type: "error",
                                content: "Something went wrong!",
                            });
                        }
                    },
                    okText: "DELETE",
                    okType: "danger",
                });
            },
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
                            modal.selectedFloorLevelId.setValue(options[0].value);

                            const resp = await handleGetFloorByLevelId({
                                landmarkId: modal.id.value,
                                levelId: options[0].value,
                            });

                            if (resp) {
                                modal.dataSet.setValue(resp.data.getFloorByLevelId);
                            }
                        } else {
                            modal.selectedFloorLevelId.setValue(undefined);
                            modal.dataSet.setValue(null);
                        }
                    }
                } catch (err) {
                    messageApi.open({
                        type: "error",
                        content: "Failed to get Landmark!",
                    });
                }
            }
        };
        fetch();
    }, [modal.id.value, modal.view.visible, drawer.refetch.value]);

    const onChangeSelect = useCallback(
        async (val: any) => {
            if (!val) return;

            modal.edit.setVisible(false);
            modal.selectedArea.setValue(null);
            form.resetFields();

            modal.selectedFloorLevelId.setValue(val);

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

    const onModalClose = () => {
        if (!modal.selectedFloorLevelId.value) {
            modal.view.setVisible(false);
            modal.edit.setVisible(false);
            modal.id.setValue(null);
            modal.selectedArea.setValue(null);
            modal.selectedTool.setValue("select");
            modal.dataSet.setValue(null);
            form.resetFields();
            return;
        }

        modalAntd.confirm({
            title: "Confirm Discard",
            content: (
                <>
                    <p>Are you sure you want to discard changes?</p>
                    <p>This action cannot be undone.</p>
                </>
            ),
            onOk: () => {
                modal.view.setVisible(false);
                modal.edit.setVisible(false);
                modal.id.setValue(null);
                modal.selectedArea.setValue(null);
                modal.selectedTool.setValue("select");
                modal.dataSet.setValue(null);
                form.resetFields();
            },
            okText: "YES",
        });
    };

    const onFinish: FormProps<FieldType>["onFinish"] = useCallback(
        async (values: FieldType) => {
            modal.dataSet.setValue((prev: any) => ({
                ...prev,
                areas: prev.areas.map((area: any) =>
                    area.id === modal.selectedArea.value.id
                        ? {
                              ...area,
                              details: {
                                  ...area.details,
                                  ...values,
                              },
                          }
                        : area
                ),
            }));

            modal.selectedArea.setValue(null);
            modal.selectedTool.setValue("select");
            form.resetFields();
        },
        [modal.selectedArea.value]
    );

    const loading = loadingGetLandmarkById || loadingGetFloorByLevelId;

    return (
        <>
            {contextHolderMessage}
            {contextHolderModal}
            <Modal
                title="Floor Plan"
                width={1500}
                zIndex={500}
                open={modal.view.visible}
                onCancel={() => onModalClose()}
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
                        <div className="col-span-2">
                            <p className="text-base !mb-4 italic">
                                {modal.dataSet.value?.name ?? ""}
                            </p>
                            <FloorPlanEditor
                                handleAreaClick={({ details }) => {
                                    form.setFieldsValue({
                                        name: details.name,
                                        description: details.description,
                                    });
                                }}
                                handleStageOpenAreaClick={() => {
                                    modal.selectedArea.setValue(null);
                                    form.resetFields();
                                }}
                            />
                        </div>
                        <div className="col-span-1 flex flex-col justify-between">
                            <div className="!space-y-6">
                                <div className="flex gap-x-4">
                                    <Select
                                        placeholder="Select Floor Level"
                                        style={{ width: 160 }}
                                        value={modal.selectedFloorLevelId.value}
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
                                        modal.view.visible &&
                                        !modal.edit.visible &&
                                        modal.selectedFloorLevelId.value
                                            ? ["edit"]
                                            : []
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
                                            <Radio.Button value="area">Area</Radio.Button>
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
                                                    form.resetFields();
                                                    modal.selectedArea.setValue(null);

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
                                                {
                                                    required:
                                                        modal.edit.visible &&
                                                        modal.selectedArea.value,
                                                    message: "Name is required",
                                                },
                                            ]}
                                        >
                                            <Input
                                                readOnly={
                                                    !modal.edit.visible || !modal.selectedArea.value
                                                }
                                                allowClear
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label="Description"
                                            name="description"
                                            rules={[
                                                {
                                                    required:
                                                        modal.edit.visible &&
                                                        modal.selectedArea.value,
                                                    message: "Description is required",
                                                },
                                            ]}
                                        >
                                            <TextArea
                                                rows={3}
                                                readOnly={
                                                    !modal.edit.visible || !modal.selectedArea.value
                                                }
                                                allowClear
                                            />
                                        </Form.Item>
                                    </Form>
                                    {modal.edit.visible && modal.selectedArea.value && (
                                        <div className="flex gap-4 justify-end">
                                            <Button
                                                danger
                                                onClick={() => {
                                                    modal.selectedArea.setValue(null);
                                                    modal.selectedTool.setValue("select");
                                                    form.resetFields();
                                                }}
                                            >
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
                                </Card>
                                {modal.selectedFloorLevelId.value && (
                                    <div className="flex justify-end gap-x-4">
                                        <Button
                                            onClick={() => {
                                                modal.edit.setVisible(false);
                                                modal.view.setVisible(false);
                                                modal.id.setValue(null);
                                                modal.selectedArea.setValue(null);
                                                modal.dataSet.setValue(null);
                                                form.resetFields();
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="primary"
                                            onClick={async () => {
                                                if (!modal.id.value) {
                                                    return;
                                                }
                                                const cleanedAreas = modal.dataSet.value.areas.map(
                                                    (area: any) => {
                                                        const isTempId =
                                                            typeof area.id === "string" &&
                                                            area.id.startsWith("element-");

                                                        return {
                                                            id: isTempId ? undefined : area.id, // remove if temp
                                                            x: area.x,
                                                            y: area.y,
                                                            width: area.width,
                                                            height: area.height,
                                                            backgroundColor: area.backgroundColor,
                                                            textColor: area.textColor,
                                                            details: {
                                                                name: area.details.name,
                                                                description:
                                                                    area.details.description,
                                                            },
                                                        };
                                                    }
                                                );

                                                const resp = await handleUpdateFloorAreas({
                                                    landmarkId: modal.id.value,
                                                    floorId: modal.dataSet.value.id,
                                                    areas: cleanedAreas,
                                                });

                                                if (!resp) {
                                                    messageApi.open({
                                                        type: "error",
                                                        content: "Failed to update Floor Plan!",
                                                    });
                                                    return;
                                                }

                                                modal.edit.setVisible(false);
                                                modal.view.setVisible(false);
                                                modal.id.setValue(null);
                                                modal.selectedArea.setValue(null);
                                                modal.dataSet.setValue(null);
                                                form.resetFields();
                                            }}
                                            loading={loadingUpdateFloorAreas}
                                        >
                                            Save Floor Plan
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default FloorPlanModal;
