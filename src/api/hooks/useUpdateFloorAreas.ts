import { useMutation } from "@apollo/client/react";
import { useCallback } from "react";
import { UPDATE_FLOOR_AREAS_MUTATION } from "../mutations/updateFloorAreas";

export interface IAreas {
    id?: string | number;
    x: number;
    y: number;
    width: number;
    height: number;
    backgroundColor: string;
    textColor: string;
    details: {
        name: string;
        description?: string;
    };
}

export interface UpdateFloorAreasVariables {}

interface IUpdateFloorAreasInput {
    landmarkId: string;
    floorId: string;
    areas: IAreas[];
}

export const useUpdateFloorAreas = () => {
    const [variables, { data, loading, error }] = useMutation(UPDATE_FLOOR_AREAS_MUTATION);

    const handleUpdateFloorAreas = useCallback((info: IUpdateFloorAreasInput) => {
        return variables({
            variables: {
                ...info,
            },
        });
    }, []);

    return { handleUpdateFloorAreas, data, loading, error };
};
