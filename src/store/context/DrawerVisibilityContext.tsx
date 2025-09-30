import { createContext, useState, type ReactNode } from "react";
import type { FloorPlanElement } from "../../types/FloorPlan";

interface DrawerState {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

interface IdState {
    value: string | null | undefined;
    setValue: React.Dispatch<React.SetStateAction<string | null | undefined>>;
}

interface DataState {
    value: any;
    setValue: React.Dispatch<React.SetStateAction<any>>;
}

interface DrawerContextType {
    add: DrawerState;
    edit: DrawerState;
    remove: DrawerState;
    view: DrawerState;
    id: IdState;
    dataSet: DataState;
    selectedElement: {
        value: FloorPlanElement | null | undefined;
        setValue: React.Dispatch<React.SetStateAction<any>>;
    };
}

const initialState: DrawerContextType = {
    add: {
        visible: false,
        setVisible: (() => {}) as React.Dispatch<React.SetStateAction<boolean>>,
    },
    edit: {
        visible: false,
        setVisible: (() => {}) as React.Dispatch<React.SetStateAction<boolean>>,
    },
    remove: {
        visible: false,
        setVisible: (() => {}) as React.Dispatch<React.SetStateAction<boolean>>,
    },
    view: {
        visible: false,
        setVisible: (() => {}) as React.Dispatch<React.SetStateAction<boolean>>,
    },
    id: {
        value: undefined,
        setValue: (() => {}) as React.Dispatch<React.SetStateAction<string | null | undefined>>,
    },
    dataSet: {
        value: undefined,
        setValue: (() => {}) as React.Dispatch<React.SetStateAction<any>>,
    },
    selectedElement: {
        value: undefined,
        setValue: (() => {}) as React.Dispatch<React.SetStateAction<any>>,
    },
};

export const DrawerVisibilityContext = createContext<DrawerContextType>(initialState);

const DrawerVisibilityProvider = ({ children }: { children: ReactNode }) => {
    const [isAddVisible, setIsAddVisible] = useState(false);
    const [isViewVisible, setIsViewVisible] = useState(false);
    const [isEditVisible, setIsEditVisible] = useState(false);
    const [isRemoveVisible, setIsRemoveVisible] = useState(false);
    const [id, setId] = useState<string | null | undefined>(undefined);
    const [dataSet, setdataSet] = useState<any>(undefined);
    const [selectedElement, setSelectedElement] = useState(undefined);

    return (
        <DrawerVisibilityContext.Provider
            value={{
                add: { visible: isAddVisible, setVisible: setIsAddVisible },
                view: { visible: isViewVisible, setVisible: setIsViewVisible },
                edit: { visible: isEditVisible, setVisible: setIsEditVisible },
                remove: { visible: isRemoveVisible, setVisible: setIsRemoveVisible },
                id: { value: id, setValue: setId },
                dataSet: { value: dataSet, setValue: setdataSet },
                selectedElement: { value: selectedElement, setValue: setSelectedElement },
            }}
        >
            {children}
        </DrawerVisibilityContext.Provider>
    );
};

export default DrawerVisibilityProvider;
