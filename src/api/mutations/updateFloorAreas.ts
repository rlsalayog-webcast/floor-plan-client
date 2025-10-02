import { gql } from "@apollo/client";

export const UPDATE_FLOOR_AREAS_MUTATION = gql`
    mutation UpdateFloorAreas(
        $landmarkId: ID!
        $floorId: ID!
        $areas: [UpdateFloorPlanAreaInput!]!
    ) {
        updateFloorAreas(landmarkId: $landmarkId, floorId: $floorId, areas: $areas) {
            id
            x
            y
            width
            height
            backgroundColor
            textColor
            details {
                name
                description
            }
        }
    }
`;
