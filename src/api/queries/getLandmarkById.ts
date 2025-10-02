import { gql } from "@apollo/client";

export const GET_LANDMARK_BY_ID_QUERY = gql`
    query GetLandmarks($id: ID!) {
        getLandmarkById(id: $id) {
            id
            name
            category
            latitude
            longitude
            floorPlans {
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
            createdAt
            updatedAt
        }
    }
`;
