import { createContext } from "react";
import type { IFloorPlanArea } from "../../types/FloorPlan";

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

interface SelectedElementState {
    value: IFloorPlanArea | null | undefined;
    setValue: React.Dispatch<React.SetStateAction<IFloorPlanArea | null | undefined>>;
}

interface DrawerGroup {
    add: DrawerState;
    edit: DrawerState;
    remove: DrawerState;
    view: DrawerState;
    id: IdState;
    dataSet: DataState;
    selectedElement: SelectedElementState;
}

interface DrawerContextType {
    modal: DrawerGroup & { selectedTool: DataState; selectedArea: DataState };
    drawer: DrawerGroup;
}

const emptyDrawerGroup: DrawerGroup = {
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
        setValue: (() => {}) as React.Dispatch<
            React.SetStateAction<IFloorPlanArea | null | undefined>
        >,
    },
};

const initialState: DrawerContextType = {
    modal: {
        ...emptyDrawerGroup,
        selectedTool: {
            value: undefined,
            setValue: (() => {}) as React.Dispatch<React.SetStateAction<any>>,
        },
        selectedArea: {
            value: undefined,
            setValue: (() => {}) as React.Dispatch<React.SetStateAction<any>>,
        },
    },
    drawer: emptyDrawerGroup,
};

const DrawerVisibilityContext = createContext<DrawerContextType>(initialState);

export const DrawerVisibilityProvider = DrawerVisibilityContext.Provider;

export default DrawerVisibilityContext;
