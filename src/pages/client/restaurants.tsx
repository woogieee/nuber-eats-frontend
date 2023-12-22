import { gql, useQuery } from "@apollo/client";
import {
  RestaurantsPageQuery,
  RestaurantsPageQueryVariables,
} from "../../__generated__/graphql";

const RESTAURANTS_QUERY = gql`
  query restaurantsPage($input: RestaurantsInput!) {
    allCategories {
      ok
      error
      categories {
        id
        name
        coverImg
        slug
        restaurantCount
      }
    }
    restaurants(input: $input) {
      ok
      error
      totalPages
      totalResults
      results {
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

export const Restaurants = () => {
  const { data, loading } = useQuery<
    RestaurantsPageQuery,
    RestaurantsPageQueryVariables
  >(RESTAURANTS_QUERY, {
    variables: {
      input: {
        page: 1,
      },
    },
  });
  return (
    <div>
      <form className="bg-gray-800 w-full py-40 flex items-center justify-center">
        <input
          type="Search"
          className="input rounded-md border-0 w-3/12"
          placeholder="Search Restaurants..."
        />
      </form>
      {!loading && (
        // 레스토랑, 카테고리
        <div className=" max-w-screen-xl mx-auto mt-8">
          {/* 카테고리 */}
          <div className="flex justify-around max-w-sm mx-auto">
            {data?.allCategories.categories?.map((category) => (
              <div className="flex flex-col items-center cursor-pointer">
                <div
                  className="w-14 h-14 bg-cover hover:bg-gray-100 rounded-full"
                  style={{ backgroundImage: `url(${category.coverImg})` }}
                ></div>
                <span className="mt-1 text-sm text-center font-medium">
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
