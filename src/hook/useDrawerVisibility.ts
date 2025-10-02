import { useState } from "react";
import type { IFloorPlanArea } from "../types/FloorPlan";

const useDrawerVisibility = () => {
    const [isAddVisible, setIsAddVisible] = useState(false);
    const [isViewVisible, setIsViewVisible] = useState(false);
    const [isEditVisible, setIsEditVisible] = useState(false);
    const [isRemoveVisible, setIsRemoveVisible] = useState(false);
    const [id, setId] = useState<string | null | undefined>(undefined);
    const [dataSet, setdataSet] = useState<any>(undefined);
    const [selectedElement, setSelectedElement] = useState<IFloorPlanArea | null | undefined>(
        undefined
    );

    return {
        add: { visible: isAddVisible, setVisible: setIsAddVisible },
        view: { visible: isViewVisible, setVisible: setIsViewVisible },
        edit: { visible: isEditVisible, setVisible: setIsEditVisible },
        remove: { visible: isRemoveVisible, setVisible: setIsRemoveVisible },
        id: { value: id, setValue: setId },
        dataSet: { value: dataSet, setValue: setdataSet },
        selectedElement: { value: selectedElement, setValue: setSelectedElement },
    };
};

export default useDrawerVisibility;
