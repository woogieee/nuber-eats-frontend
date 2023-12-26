import { gql, useQuery } from "@apollo/client";
import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  CategoryQuery,
  CategoryQueryVariables,
} from "../../__generated__/graphql";

const CATEGORY_QUERY = gql`
  query category($input: CategoryInput!) {
    category(input: $input) {
      ok
      error
      totalPages
      totalResults
      category {
        id
        name
        coverImg
        slug
        restaurantCount
      }
      restaurants {
        id
        name
        coverImg
        category {
          name
        }
        address
        isPromoted
      }
    }
  }
`;

interface ICategoryParams {
  slug: string;
}

export const Category = () => {
  const params = useParams<ICategoryParams>();
  const { data, loading } = useQuery<CategoryQuery, CategoryQueryVariables>(
    CATEGORY_QUERY,
    {
      variables: {
        input: {
          page: 1,
          slug: params.slug,
        },
      },
    }
  );
  console.log(data);
  return <h1>Category</h1>;
};
