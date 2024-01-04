import { gql, useApolloClient, useQuery } from "@apollo/client";
import { MyRestaurantsQuery } from "../../__generated__/graphql";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Restaurant } from "../../components/restaurant";
import { useEffect } from "react";

export const MY_RESTAURANTS_QUERY = gql`
  query myRestaurants {
    myRestaurants {
      ok
      error
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

export const MyRestaurants = () => {
  const { data } = useQuery<MyRestaurantsQuery>(MY_RESTAURANTS_QUERY);
  const client = useApolloClient();
  useEffect(() => {
    setTimeout(() => {
      const queryResult = client.readQuery({ query: MY_RESTAURANTS_QUERY }); // cache에서 읽음, api로 보내지 않음
      console.log(queryResult);
      client.writeQuery({
        query: MY_RESTAURANTS_QUERY,
        data: {
          myRestaurants: {
            // 원래 있던 쿼리를 무조건 다시 넣어야됨.
            ...queryResult.myRestaurants,
            restaurants: [
              { name: "fake guy" },
              ...queryResult.myRestaurants.restaurant,
            ],
          },
        },
      });
    }, 2000);
  }, []);
  return (
    <div>
      <Helmet>
        <title>My Restaurants | Nuber Eats</title>
      </Helmet>
      <div className="max-w-screen-xl mx-auto mt-32">
        <h2 className="text-4xl font-medium mb-10">My Restaurants</h2>
        {data?.myRestaurants.ok &&
        data.myRestaurants.restaurants.length === 0 ? (
          <>
            <h4 className="text-xl mb-5">You have no restaurants.</h4>
            <Link
              className="text-lime-600 hover:underline"
              to="/add-restaurant"
            >
              Create one &rarr;
            </Link>
          </>
        ) : (
          <div className="grid mt-16 md:grid-cols-3 gap-x-5 gap-y-10">
            {data?.myRestaurants.restaurants.map((restaurant) => (
              <Restaurant
                key={restaurant.id}
                id={restaurant.id + ""}
                coverImg={restaurant.coverImg}
                name={restaurant.name}
                categoryName={restaurant.category?.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
