import { PlusOutlined } from "@ant-design/icons";
import { Button, Drawer, Form, Input, message, Modal, Space, type FormProps } from "antd";
import { useCallback } from "react";

interface FieldType {
    name: string;
    description: string;
}

const FloorDrawer = () => {
    const [modal, contextHolderModal] = Modal.useModal();
    const [messageApi, contextHolderMessage] = message.useMessage();
    const [form] = Form.useForm();

    const onClickSubmit = useCallback(() => {
        form.submit();
    }, [form]);

    const onFinish: FormProps<FieldType>["onFinish"] = useCallback(async (values: FieldType) => {
        console.log("onFinish >> ", values);
    }, []);

    const onClose = useCallback(() => {}, []);

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
                title="Create Floor"
                // title={
                //     add.visible
                //         ? "Add Item"
                //         : view.visible
                //         ? "View Item"
                //         : edit.visible
                //         ? "Edit Item"
                //         : ""
                // }
                width={600}
                onClose={onCloseForm}
                open={false}
                // open={add.visible || view.visible || edit.visible}
                extra={
                    <Space>
                        <Button onClick={onClickSubmit} type="primary" icon={<PlusOutlined />}>
                            Add
                        </Button>
                        {/* {(add.visible || edit.visible) && (
                            <Button
                                onClick={onClickSubmit}
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
                        )} */}
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
