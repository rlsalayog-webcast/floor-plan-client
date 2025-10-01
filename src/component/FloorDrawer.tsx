import { PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Drawer, Form, Input, message, Modal, Space, type FormProps } from "antd";
import { useCallback, useContext } from "react";
import DrawerVisibilityContext from "../store/context/DrawerVisibilityContext";

interface FieldType {
    name: string;
    description: string;
}

const FloorDrawer = () => {
    const { drawer } = useContext(DrawerVisibilityContext);
    const [modal, contextHolderModal] = Modal.useModal();
    const [messageApi, contextHolderMessage] = message.useMessage();
    const [form] = Form.useForm();

    const onClickSubmit = useCallback(() => {
        form.submit();
    }, [form]);

    const onFinish: FormProps<FieldType>["onFinish"] = useCallback(async (values: FieldType) => {
        console.log("onFinish >> ", values);
    }, []);

    const onClose = useCallback(() => {
        drawer.view.setVisible(false);
        drawer.add.setVisible(false);
        drawer.edit.setVisible(false);
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
            // setFileList([]);
            onClose();
        }
    }, [form, modal, onClose]);

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
                                // loading={isSubmitting}
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
