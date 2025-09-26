export interface FloorPlanElement {
    id: string;
    type: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    radius?: number;
    fill: string;
    attributes: {
        name: string;
        description: string;
        [key: string]: any;
    };
}

export interface FloorPlan {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    elements: FloorPlanElement[];
    createdAt: Date;
    updatedAt: Date;
}
