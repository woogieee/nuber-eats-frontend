import { gql } from "@apollo/client";

// on 뒤에 나오는 쿼리명은 백앤드와 동일해야 됨

export const RESTAURANT_FRAGMENT = gql`
  fragment RestaurantParts on Restaurant {
    id
    name
    coverImg
    category {
      name
    }
    address
    isPromoted
  }
`;

export const CATEGORY_FRAGMENT = gql`
  fragment CategoryParts on Category {
    id
    name
    coverImg
    slug
    restaurantCount
  }
`;