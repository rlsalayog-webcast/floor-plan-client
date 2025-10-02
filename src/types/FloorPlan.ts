export interface IFloorPlanAreaDetails {
    name: string;
    description: string;
}

export interface IFloorPlanArea {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    backgroundColor: string;
    textColor: string;
    details: IFloorPlanAreaDetails;
}

export interface IFloor {
    id: string;
    level: string;
    name: string;
    description?: string;
    areas?: IFloorPlanArea[];
}
