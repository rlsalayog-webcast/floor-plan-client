import { gql } from "@apollo/client";

export const GET_FLOOR_BY_LEVEL_ID_QUERY = gql`
    query GetFloorByLevelId($landmarkId: ID!, $levelId: String!) {
        getFloorByLevelId(landmarkId: $landmarkId, levelId: $levelId) {
            id
            level
            name
            description
            areas {
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
    }
`;
