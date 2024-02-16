import { gql, useQuery, useSubscription } from "@apollo/client";
import {
  MyRestaurantsQuery,
  PendingOrdersSubscription,
} from "../../__generated__/graphql";
import { Helmet } from "react-helmet-async";
import { Link, useHistory } from "react-router-dom";
import { Restaurant } from "../../components/restaurant";
import { FULL_ORDER_FRAGMENT } from "../../fragments";
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

const PENDING_ORDERS_SUBSCRIPTION = gql`
  subscription pendingOrders {
    pendingOrders {
      ...FullOrderParts
    }
  }
  ${FULL_ORDER_FRAGMENT}
`;

export const MyRestaurants = () => {
  const { data } = useQuery<MyRestaurantsQuery>(MY_RESTAURANTS_QUERY);

  const { data: subscriptionData } = useSubscription<PendingOrdersSubscription>(
    PENDING_ORDERS_SUBSCRIPTION
  );

  const history = useHistory();
  useEffect(() => {
    if (subscriptionData?.pendingOrders.id) {
      // history.push(`/orders/${subscriptionData.pendingOrders.id}`);
      window.open(`/orders/${subscriptionData.pendingOrders.id}`, "_blank");
      // subscriptionData가 있으면 오더 페이지로 보냄
    }
  }, [subscriptionData, history]);

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
            {data?.myRestaurants.restaurants
              .slice() // 배열 복사
              .sort((a, b) => a.id - b.id) // ID에 따라 오름차순 정렬
              .map((restaurant) => (
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
      {data?.myRestaurants.ok &&
      data.myRestaurants.restaurants.length === 0 ? null : (
        <div className="max-w-screen-xl mx-auto mt-32 text-center">
          <Link className="text-lime-600 hover:underline" to="/add-restaurant">
            Create one &rarr;
          </Link>
        </div>
      )}
    </div>
  );
};
