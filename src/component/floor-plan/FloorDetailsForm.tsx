import { PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Drawer, Form, Input, message, Modal, Space, type FormProps } from "antd";
import { useCallback, useContext, useState } from "react";
import { DrawerVisibilityContext } from "../../store/context/DrawerVisibilityContext";

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
    const { view, add, edit, id } = useContext(DrawerVisibilityContext);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onFinish: FormProps<FieldType>["onFinish"] = useCallback(async (values: FieldType) => {
        onClose();
    }, []);

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
                title={"Edit Landmark"}
                width={600}
                onClose={onCloseForm}
                open={isEditDetailsVisible}
                extra={
                    <Space>
                        {(add.visible || edit.visible) && (
                            <Button
                                onClick={() => form.submit()}
                                type="primary"
                                icon={
                                    add.visible ? (
                                        <PlusOutlined />
                                    ) : edit.visible ? (
                                        <SaveOutlined />
                                    ) : (
                                        ""
                                    )
                                }
                                loading={isSubmitting}
                            >
                                {add.visible ? "Add" : edit.visible ? "Save" : ""}
                            </Button>
                        )}
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
                        <Input allowClear />
                    </Form.Item>
                </Form>
            </Drawer>
        </>
    );
};

export default FloorDetailsFormDrawer;
