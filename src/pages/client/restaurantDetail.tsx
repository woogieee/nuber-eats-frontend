import { gql, useMutation, useQuery } from "@apollo/client";
import { useHistory, useParams } from "react-router-dom";
import {
  CreateOrderItemInput,
  CreateOrderMutation,
  CreateOrderMutationVariables,
  RestaurantQuery,
  RestaurantQueryVariables,
} from "../../__generated__/graphql";
import { Helmet } from "react-helmet-async";
import { Dish } from "../../components/dish";
import { useState } from "react";
import { DishOption } from "../../components/dish-option";
import { DISH_FRAGMENT, RESTAURANT_FRAGMENT } from "../../fragments";

const RESTAURANT_QUERY = gql`
  query restaurant($input: RestaurantInput!) {
    restaurant(input: $input) {
      ok
      error
      restaurant {
        ...RestaurantParts
        menu {
          ...DishParts
        }
      }
    }
  }
  ${DISH_FRAGMENT}
  ${RESTAURANT_FRAGMENT}
`;

const CREATE_ORDER_MUTATION = gql`
  mutation createOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      ok
      error
      orderId
    }
  }
`;

interface IRestaurantParams {
  id: string;
}

export const Restaurant = () => {
  const params = useParams<IRestaurantParams>();

  // 모달 시작
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
    // 여기에서 총 합계를 계산하고 필요한 경우 상태를 업데이트합니다.
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  // 모달 종료

  const { data } = useQuery<RestaurantQuery, RestaurantQueryVariables>(
    RESTAURANT_QUERY,
    {
      variables: {
        input: {
          restaurantId: +params.id,
        },
      },
    }
  );
  // 오더 상태
  const [orderStarted, setOrderStarted] = useState(false);
  // 오더 아이템 상태
  const [orderItems, setOrderItems] = useState<CreateOrderItemInput[]>([]);
  // Start Order 버튼 클릭
  const triggerStartOrder = () => {
    setOrderStarted(true);
  };

  const getItem = (dishId: number) => {
    return orderItems.find((order) => order.dishId === dishId);
  };
  // 아이템이 선택 되었는지
  const isSelected = (dishId: number) => {
    return Boolean(getItem(dishId));
  };
  // 아이템 추가
  const addItemToOrder = (dishId: number) => {
    if (isSelected(dishId)) {
      return;
    }
    setOrderItems((current) => [{ dishId, options: [] }, ...current]);
  };
  // 아이템 빼기
  const removeFromOrder = (dishId: number) => {
    setOrderItems((current) =>
      current.filter((dish) => dish.dishId !== dishId)
    );
  };
  // order에 option 추가
  const addOptionToItem = (dishId: number, optionName: string) => {
    if (!isSelected(dishId)) {
      return;
    }
    // item을 가져와서 option과 함께 다시 넣음 -> state를 mutate 하지 않기 위해 -> 항상 새 state를 return하기 위해
    const oldItem = getItem(dishId);
    if (oldItem) {
      // order에 옵션을 가지고 있으면 실행 안함
      const hasOption = Boolean(
        // aOption은 oldItem에서 받은 option, option.name은 새로 추가하려는 option
        oldItem.options?.find((aOption) => aOption.name === optionName)
      );
      if (!hasOption) {
        removeFromOrder(dishId);
        setOrderItems((current) => [
          { dishId, options: [{ name: optionName }, ...oldItem.options!] },
          ...current,
        ]);
      }
    }
  };
  const getOptionFromItem = (
    item: CreateOrderItemInput,
    optionName: string
  ) => {
    return item.options?.find((option) => option.name === optionName);
  };
  // 옵션 선택
  const isOptionSelected = (dishId: number, optionName: string) => {
    const item = getItem(dishId);
    if (item) {
      return Boolean(getOptionFromItem(item, optionName));
    }
    return false;
  };
  // 옵션 빼기
  const removeOptionFromItem = (dishId: number, optionName: string) => {
    // 아이템이 선택 되었는지 확인
    if (!isSelected(dishId)) {
      return;
    }
    const oldItem = getItem(dishId);
    if (oldItem) {
      // order에서 item을 제거
      removeFromOrder(dishId);
      // order에서 item을 다시 추가, dishId, options가 들어감
      setOrderItems((current) => [
        {
          dishId,
          options: oldItem.options?.filter(
            // filter는 조건을 만족하는 element들을 모아 array로 return함
            (option) => option.name !== optionName
          ),
        },
        ...current,
      ]);
      return;
    }
  };
  // 오더 취소
  const triggerCancelOrder = () => {
    setOrderStarted(false);
    setOrderItems([]);
  };
  const history = useHistory();
  const onCompleted = (data: CreateOrderMutation) => {
    const {
      createOrder: { orderId },
    } = data;
    if (data.createOrder.ok) {
      history.push(`/orders/${orderId}`);
    }
  };
  const [createOrderMutation, { loading: placingOrder }] = useMutation<
    CreateOrderMutation,
    CreateOrderMutationVariables
  >(CREATE_ORDER_MUTATION, {
    onCompleted,
  });
  // 오더 확정
  const triggerConfirmOrder = () => {
    if (placingOrder) {
      return;
    }
    if (orderItems.length === 0) {
      alert("메뉴가 선택되지 않았습니다.");
      return;
    }
    const ok = window.confirm("You are about to place an order");
    if (ok) {
      createOrderMutation({
        variables: {
          input: {
            restaurantId: +params.id,
            items: orderItems,
          },
        },
      });
    }
  };

  // 모달 계산식 시작
  // totalPrice 계산 함수
  const calculateTotalPrice = () => {
    let totalPrice = 0;
    orderItems.forEach((item) => {
      const dish = data?.restaurant.restaurant?.menu.find(
        (d) => d.id === item.dishId
      );
      if (dish) {
        totalPrice += dish.price;
      }
    });
    return totalPrice;
  };

  // totalOptionPrice 계산 함수
  const calculateTotalOptionPrice = () => {
    let totalOptionPrice = 0;
    orderItems.forEach((item) => {
      const dish = data?.restaurant.restaurant?.menu.find(
        (d) => d.id === item.dishId
      );
      if (dish?.options) {
        dish.options?.forEach((dishOption) => {
          // 선택된 option들만 체크해서 더하기
          if (isOptionSelected(item.dishId, dishOption.name)) {
            totalOptionPrice += dishOption.extra || 0;
          }
        });
      }
    });
    return totalOptionPrice;
  };
  const totalPrice = calculateTotalPrice();
  const totalOptionPrice = calculateTotalOptionPrice();
  // 모달 계산식 종료
  return (
    <div>
      <Helmet>
        <title>{data?.restaurant.restaurant?.name || ""} | Nuber Eats</title>
      </Helmet>
      <div
        className="bg-gray-800 bg-center bg-cover py-48"
        style={{
          backgroundImage: `url(${data?.restaurant.restaurant?.coverImg})`,
        }}
      >
        <div className="bg-white xl:w-3/12 py-8 xl:pl-32">
          <h4 className="text-4xl mb-3">{data?.restaurant.restaurant?.name}</h4>
          <h5 className="text-sm font-light mb-2">
            {data?.restaurant.restaurant?.category?.name}
          </h5>
          <h6 className="text-sm font-light">
            {data?.restaurant.restaurant?.address}
          </h6>
        </div>
      </div>
      <div className="container pb-32 flex flex-col items-end mt-20">
        {!orderStarted && (
          <button onClick={triggerStartOrder} className="btn px-10">
            Start Order
          </button>
        )}
        {orderStarted && (
          <div className="flex items-center">
            {/* <button onClick={triggerConfirmOrder} className="btn px-10 mr-3">
              Confirm Order
            </button> */}
            {/* Confirm Order 버튼 */}
            <button onClick={openModal} className="btn px-10 mr-3">
              Confirm Order
            </button>
            <button
              onClick={triggerCancelOrder}
              className="btn px-10 bg-black hover:bg-black"
            >
              Cancel Order
            </button>
          </div>
        )}
        <div className=" w-full grid mt-16 md:grid-cols-3 gap-x-5 gap-y-10">
          {data?.restaurant.restaurant?.menu.map((dish, index) => (
            <Dish
              isSelected={isSelected(dish.id)}
              id={dish.id}
              orderStarted={orderStarted}
              key={index}
              name={dish.name}
              description={dish.description}
              price={dish.price}
              isCustomer={true}
              options={dish.options}
              addItemToOrder={addItemToOrder}
              removeFromOrder={removeFromOrder}
              photo={dish.photo!}
            >
              {dish.options?.map((option, index) => (
                <DishOption
                  key={index}
                  dishId={dish.id}
                  isSelected={isOptionSelected(dish.id, option.name)}
                  name={option.name}
                  extra={option.extra}
                  addOptionToItem={addOptionToItem}
                  removeOptionFromItem={removeOptionFromItem}
                />
              ))}
            </Dish>
          ))}
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8">
            {/* 모달 내용 */}
            <h2 className="text-3xl font-bold mb-4">주문 내역서</h2>
            <ul>
              {orderItems.map((item, index) => (
                <li key={index} className="mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-semibold">
                        {
                          data?.restaurant.restaurant?.menu.find(
                            (dish) => dish.id === item.dishId
                          )?.name
                        }
                      </p>
                      <p className="text-sm text-gray-600">
                        $
                        {
                          data?.restaurant.restaurant?.menu.find(
                            (dish) => dish.id === item.dishId
                          )?.price
                        }
                      </p>
                    </div>
                    <ul className="ml-4">
                      {item.options?.map((option, optionIndex) => (
                        <li key={optionIndex} className="text-sm text-gray-600">
                          {option.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <p className="text-lg font-semibold">
                Total Price: ${totalPrice}
              </p>
              <p className="text-lg font-semibold">
                Total Option Price: ${totalOptionPrice}
              </p>
              <p className="text-lg font-semibold">
                Total Order Price: ${totalPrice + totalOptionPrice}
              </p>
            </div>

            {/* 확인 및 취소 버튼 */}
            <div className="mt-6 flex justify-end">
              <button onClick={triggerConfirmOrder} className="btn px-4 mr-2">
                OK
              </button>
              <button
                onClick={closeModal}
                className="btn px-4 bg-black hover:bg-black"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
