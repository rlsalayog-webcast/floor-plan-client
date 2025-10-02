import { PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Drawer, Form, Input, message, Modal, Space, type FormProps } from "antd";
import { useCallback, useContext, useState } from "react";
import { useCreateFloor } from "../api/hooks/useCreateFloor";
import DrawerVisibilityContext from "../store/context/DrawerVisibilityContext";

interface FieldType {
    name: string;
    level: string;
}

const FloorDrawer = () => {
    const { modal, drawer } = useContext(DrawerVisibilityContext);
    const [modalAntd, contextHolderModal] = Modal.useModal();
    const [messageApi, contextHolderMessage] = message.useMessage();
    const [form] = Form.useForm();
    const { handleCreateFloor, data, loading, error } = useCreateFloor();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onClickSubmit = useCallback(() => {
        form.submit();
    }, [form]);

    const onFinish: FormProps<FieldType>["onFinish"] = useCallback(
        async (values: FieldType) => {
            setIsSubmitting(true);
            if (drawer.add.visible && modal.id.value) {
                try {
                    const resp = await handleCreateFloor({ landmarkId: modal.id.value, ...values });
                    if (resp) {
                        messageApi.open({
                            type: "success",
                            content: "Floor added successfully!",
                        });
                        // refetch();
                        drawer.add.setVisible(false);
                    }
                } catch (err) {
                    messageApi.open({
                        type: "error",
                        content: "Failed to add Floor!",
                    });
                } finally {
                    setIsSubmitting(false);
                }
            }
        },
        [drawer.id.value, drawer.add.visible, modal.id.value]
    );

    const onClose = useCallback(() => {
        drawer.view.setVisible(false);
        drawer.add.setVisible(false);
        drawer.edit.setVisible(false);
    }, []);

    const onCloseForm = useCallback(() => {
        if (form.isFieldsTouched()) {
            modalAntd.confirm({
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
    }, [form, modalAntd, onClose]);

    return (
        <>
            {contextHolderModal}
            {contextHolderMessage}
            <Drawer
                title={
                    drawer.add.visible
                        ? "Add Floor"
                        : drawer.view.visible
                        ? "View Floor"
                        : drawer.edit.visible
                        ? "Edit Floor"
                        : ""
                }
                width={600}
                zIndex={1000}
                onClose={onCloseForm}
                open={drawer.add.visible || drawer.view.visible || drawer.edit.visible}
                extra={
                    <Space>
                        {(drawer.add.visible || drawer.edit.visible) && (
                            <Button
                                onClick={onClickSubmit}
                                type="primary"
                                icon={
                                    drawer.add.visible ? (
                                        <PlusOutlined />
                                    ) : drawer.edit.visible ? (
                                        <SaveOutlined />
                                    ) : (
                                        ""
                                    )
                                }
                                loading={isSubmitting}
                            >
                                {drawer.add.visible ? "Add" : drawer.edit.visible ? "Save" : ""}
                            </Button>
                        )}
                    </Space>
                }
                afterOpenChange={(open) => {
                    if (!open) {
                        form.resetFields();
                    }
                }}
                // loading={isLoading}
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
                        label="Floor Level"
                        name="level"
                        rules={[{ required: true, message: "Floor is required" }]}
                    >
                        <Input allowClear />
                    </Form.Item>
                </Form>
            </Drawer>
        </>
    );
};

export default FloorDrawer;
