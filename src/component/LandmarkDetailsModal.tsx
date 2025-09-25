import { Card, Modal } from "antd";
import { useContext } from "react";
import { DrawerVisibilityContext } from "../store/context/DrawerVisibilityContext";

const LandmarkDetailsModal = () => {
    const { view } = useContext(DrawerVisibilityContext);

    return (
        <Modal
            title="Landmark"
            width={1500}
            open={view.visible}
            onCancel={() => view.setVisible(false)}
            footer={null}
        >
            <div className="min-h-96 grid grid-cols-[2fr_1fr] gap-10">
                <div className="h-full bg-black"></div>
                <Card title="Details">
                    <p>Card content</p>
                    <p>Card content</p>
                    <p>Card content</p>
                </Card>
            </div>
        </Modal>
    );
};

export default LandmarkDetailsModal;
