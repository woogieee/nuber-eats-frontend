import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import { Link, useHistory, useParams } from "react-router-dom";
import {
  DeleteDishMutation,
  DeleteDishMutationVariables,
  MyRestaurantQuery,
  MyRestaurantQueryVariables,
  PendingOrdersSubscription,
} from "../../__generated__/graphql";
import { Helmet } from "react-helmet-async";
import { Dish } from "../../components/dish";
import {
  VictoryAxis,
  VictoryChart,
  VictoryLabel,
  VictoryLine,
  VictoryTheme,
  VictoryVoronoiContainer,
} from "victory";
import {
  DISH_FRAGMENT,
  FULL_ORDER_FRAGMENT,
  ORDERS_FRAGMENT,
  RESTAURANT_FRAGMENT,
} from "../../fragments";
import { useEffect } from "react";

export const MY_RESTAURANT_QUERY = gql`
  query myRestaurant($input: MyRestaurantInput!) {
    myRestaurant(input: $input) {
      ok
      error
      restaurant {
        ...RestaurantParts
        menu {
          ...DishParts
        }
        orders {
          ...OrderParts
        }
      }
    }
  }
  ${RESTAURANT_FRAGMENT}
  ${DISH_FRAGMENT}
  ${ORDERS_FRAGMENT}
`;

const PENDING_ORDERS_SUBSCRIPTION = gql`
  subscription pendingOrders {
    pendingOrders {
      ...FullOrderParts
    }
  }
  ${FULL_ORDER_FRAGMENT}
`;

const DELETE_DISH_MUTATION = gql`
  mutation deleteDish($input: DeleteDishInput!) {
    deleteDish(input: $input) {
      ok
      error
    }
  }
`;

interface IParams {
  id: string;
}

export const MyRestaurant = () => {
  const { id } = useParams<IParams>();
  const { data } = useQuery<MyRestaurantQuery, MyRestaurantQueryVariables>(
    MY_RESTAURANT_QUERY,
    {
      variables: {
        input: {
          id: +id,
        },
      },
    }
  );
  const { data: subscriptionData } = useSubscription<PendingOrdersSubscription>(
    PENDING_ORDERS_SUBSCRIPTION
  );
  // const { data: dishDeleteData } = useMutation<
  //   DeleteDishMutation,
  //   DeleteDishMutationVariables
  // >(DELETE_DISH_MUTATION);
  const history = useHistory();
  useEffect(() => {
    if (subscriptionData?.pendingOrders.id) {
      history.push(`/orders/${subscriptionData.pendingOrders.id}`);
      // subscriptionData가 있으면 오더 페이지로 보냄
    }
  }, [subscriptionData, history]);

  /* 차트 x축, y축 그룹화 시작 */
  const orders = data?.myRestaurant.restaurant?.orders;
  // 주문을 yyyy-mm-dd으로 그룹화하고 동일한 날짜에 대한 total을 합산
  const groupedOrders: { createdAt: string; total: number }[] | undefined =
    orders?.reduce((acc, order) => {
      if (order?.createdAt && typeof order.total === "number") {
        const createdAtDate = new Date(order.createdAt);
        const formattedDate = `${createdAtDate.getFullYear()}-${(
          createdAtDate.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${createdAtDate
          .getDate()
          .toString()
          .padStart(2, "0")}`;
        const existingGroup = acc.find(
          (group) => group.createdAt === formattedDate
        );

        if (existingGroup) {
          // 그룹이 이미 존재하면 total을 기존 그룹에 더함
          existingGroup.total += order.total;
        } else {
          // 그룹이 존재하지 않으면 새로운 그룹을 생성
          acc.push({
            createdAt: formattedDate,
            total: order.total,
          });
        }
      }

      return acc;
    }, [] as { createdAt: string; total: number }[]);

  // 만약 그룹화된 주문이 비어 있다면, 더미 데이터를 추가
  if (groupedOrders && groupedOrders.length === 0) {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${(
      currentDate.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${currentDate.getDate().toString().padStart(2, "0")}`;

    groupedOrders.push({
      createdAt: formattedDate,
      total: 0, // 더미 데이터이므로 0으로 설정하거나 다른 기본값을 사용하세요.
    });
  }

  // 그룹화된 주문을 차트에 표시할 형식으로 변환
  const chartData =
    groupedOrders?.map((group) => ({
      x: group.createdAt,
      y: group.total,
    })) || [];

  console.log(chartData);
  /* 차트 x축, y축 그룹화 종료 */

  /* Dish 삭제 시작 */
  const [deleteDishMutation] = useMutation<
    DeleteDishMutation,
    DeleteDishMutationVariables
  >(DELETE_DISH_MUTATION);
  const dishDeletebtnClick = async (id: number, name: string) => {
    const confirmed = window.confirm(`${name} 를 삭제하시겠습니까?`);
    if (confirmed) {
      try {
        await deleteDishMutation({
          variables: {
            input: {
              dishId: id,
            },
          },
        });
        window.location.reload();
      } catch (e) {}
    }
  };
  /* Dish 삭제 종료 */

  return (
    <div>
      <Helmet>
        <title>
          {data?.myRestaurant.restaurant?.name || "Loading..."} | Nuber Eats
        </title>
      </Helmet>
      <div
        className=" bg-gray-700 py-28 bg-center bg-cover"
        style={{
          backgroundImage: `url(${data?.myRestaurant.restaurant?.coverImg})`,
        }}
      ></div>
      <div className=" container mt-10">
        <h2 className="text-4xl font-medium mb-10">
          {data?.myRestaurant.restaurant?.name || "Loading..."}
        </h2>
        <Link
          to={`/restaurant/${id}/add-dish`}
          className=" mr-8 text-white bg-gray-800 py-3 px-10"
        >
          Add Dish &rarr;
        </Link>
        {/* <Link to={``} className=" text-white bg-lime-700 py-3 px-10">
          Buy Promotion &rarr;
        </Link> */}

        <Link
          to={`/edit-restaurant/${id}`}
          className=" text-white bg-lime-700 py-3 px-10"
        >
          Edit Restaurant &rarr;
        </Link>
        <div className="mt-10">
          {data?.myRestaurant.restaurant?.menu.length === 0 ? (
            <h4 className="text-xl mb-5">Please upload a dish!</h4>
          ) : (
            <div className="grid mt-16 md:grid-cols-3 gap-x-5 gap-y-10">
              {data?.myRestaurant.restaurant?.menu.map((dish, index) => (
                <Dish
                  key={index}
                  name={dish.name}
                  description={dish.description}
                  price={dish.price}
                  photo={dish.photo!}
                  id={dish.id}
                  dishDeletebtnClick={dishDeletebtnClick}
                />
              ))}
            </div>
          )}
        </div>
        {/* 차트 */}
        <div className=" mt-20 mb-10">
          <h4 className=" text-center text-2xl font-medium">Sales</h4>
          <div className=" mt-10">
            <VictoryChart
              height={500}
              theme={VictoryTheme.material}
              width={window.innerWidth}
              domainPadding={50}
              containerComponent={<VictoryVoronoiContainer />}
            >
              <VictoryLine
                // @ts-ignore
                labels={({ datum }) => `$${datum.y.toLocaleString()}`} // 여기서 숫자 포맷을 설정
                labelComponent={
                  <VictoryLabel
                    style={{ fontSize: 18 }}
                    renderInPortal
                    dy={-20}
                  />
                }
                data={chartData}
                // {data?.myRestaurant.restaurant?.orders.map((order) => ({
                //   x: order.createdAt,
                //   y: order.total,
                // }))}
                interpolation="natural"
                style={{
                  data: {
                    strokeWidth: 5,
                  },
                }}
              />
              <VictoryAxis
                tickLabelComponent={<VictoryLabel renderInPortal />}
                style={{
                  tickLabels: {
                    fontSize: 20,
                  },
                }}
                tickFormat={(tick) => new Date(tick).toLocaleDateString("ko")}
              />
            </VictoryChart>
          </div>
        </div>
      </div>
    </div>
  );
};
