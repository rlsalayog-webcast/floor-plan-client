import { SaveOutlined } from "@ant-design/icons";
import { Button, Drawer, Form, Input, message, Modal, Space, type FormProps } from "antd";
import { useCallback, useContext, useEffect, useState } from "react";
import { DrawerVisibilityContext } from "../../store/context/DrawerVisibilityContext";
import type { FloorPlanElement } from "../../types/FloorPlan";

const { TextArea } = Input;

interface FieldType {
    name: string;
    category: string;
    latitude: string;
    longitude: string;
    area: string;
    location: undefined;
}

const FloorDetailsFormDrawer = ({
    isEditDetailsVisible,
    setIsEditDetailsVisible,
}: {
    isEditDetailsVisible: boolean;
    setIsEditDetailsVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    /* Antd */
    const [modal, contextHolderModal] = Modal.useModal();
    const [messageApi, contextHolderMessage] = message.useMessage();
    const [form] = Form.useForm();

    /* States */
    const { id, dataSet } = useContext(DrawerVisibilityContext);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const data = dataSet.value?.find((element: any) => element.id === id.value);
        form.setFieldsValue({
            name: data?.attributes.name,
            description: data?.attributes.description,
        });
    }, [isEditDetailsVisible, dataSet.value?.length, id.value]);

    const onFinish: FormProps<FieldType>["onFinish"] = useCallback(
        async (values: FieldType) => {
            dataSet.setValue((prev: FloorPlanElement[]) =>
                prev.map((el: FloorPlanElement) =>
                    el.id === id.value
                        ? {
                              ...el,
                              attributes: {
                                  ...values,
                              },
                          }
                        : el
                )
            );
            onClose();
        },
        [id.value]
    );

    const onCloseForm = useCallback(() => {
        if (form.isFieldsTouched()) {
            modal.confirm({
                title: "Confirm Discard",
                content: (
                    <>
                        <p>Are you sure you want to discard changes?</p>
                        <p>This action cannot be undone.</p>
                    </>
                ),
                onOk: () => {
                    onClose();
                },
                okText: "YES",
            });
        } else {
            onClose();
        }
    }, [form, modal]);

    const onClose = () => {
        setIsEditDetailsVisible(false);
    };

    return (
        <>
            {contextHolderModal}
            {contextHolderMessage}
            <Drawer
                title={"Edit Floor Plan"}
                width={600}
                onClose={onCloseForm}
                open={isEditDetailsVisible}
                extra={
                    <Space>
                        <Button
                            onClick={() => form.submit()}
                            type="primary"
                            icon={<SaveOutlined />}
                            loading={isSubmitting}
                        >
                            Save
                        </Button>
                    </Space>
                }
                afterOpenChange={(open) => {
                    if (!open) {
                        form.resetFields();
                    }
                }}
                // loading={loading}
            >
                <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: "Name is required" }]}
                    >
                        <Input allowClear />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[{ required: true, message: "Description is required" }]}
                    >
                        <TextArea rows={3} allowClear />
                    </Form.Item>
                </Form>
            </Drawer>
        </>
    );
};

export default FloorDetailsFormDrawer;
