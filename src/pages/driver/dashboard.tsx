import { gql, useMutation, useSubscription } from "@apollo/client";
import GoogleMapReact from "google-map-react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { FULL_ORDER_FRAGMENT } from "../../fragments";
import {
  CookedOrdersSubscription,
  TakeOrderMutation,
  TakeOrderMutationVariables,
} from "../../__generated__/graphql";
import { useHistory } from "react-router-dom";

const COOKED_ORDERS_SUBSCRIPTION = gql`
  subscription cookedOrders {
    cookedOrders {
      ...FullOrderParts
    }
  }
  ${FULL_ORDER_FRAGMENT}
`;

const TAKE_ORDER_MUTATION = gql`
  mutation takeOrder($input: TakeOrderInput!) {
    takeOrder(input: $input) {
      ok
      error
    }
  }
`;

interface ICoords {
  lat: number;
  lng: number;
}

interface IDriverProps {
  lat: number;
  lng: number;
  $hover?: any;
}

const Driver: React.FC<IDriverProps> = () => <div className="text-lg">🚘</div>;

export const Dashboard = () => {
  const [driverCoords, setDriverCoords] = useState<ICoords>({ lng: 0, lat: 0 });
  const [map, setMap] = useState<google.maps.Map>();
  const [maps, setMaps] = useState<any>();
  // 주문 데이터 가져오기
  const { data: cookedOrdersData } = useSubscription<CookedOrdersSubscription>(
    COOKED_ORDERS_SUBSCRIPTION
  );
  // 위치를 state에 저장
  const onSuccess = ({
    coords: { latitude, longitude },
  }: GeolocationPosition) => {
    // 위치 좌표찾기
    setDriverCoords({ lat: latitude, lng: longitude });
  };
  const onError = (error: GeolocationPositionError) => {
    console.log(error);
  };

  useEffect(() => {
    // 본인 위치값 가져오기
    navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      // 내가 움직이면 움진인걸 알 수 있음.
    });
  }, []);
  useEffect(() => {
    // driver의 좌표가 바뀔 때마다 실행됨
    if (map && maps) {
      map.panTo(new google.maps.LatLng(driverCoords.lat, driverCoords.lng));
      /**
       * Geocoder
       * driverCoodrs.lat와 driverCoords.lng를 받으면 생성
       */
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        {
          location: new google.maps.LatLng(driverCoords.lat, driverCoords.lng),
        },
        (results, status) => {
          console.log(status, results);
        }
      );
    }
  });

  const onApiLoaded = ({ map, maps }: { map: any; maps: any }) => {
    // 이 함수를 통해서 map 객체와 상호작용
    // map과 maps의 차이점, map은 화면에 보이는 지도의 정보, maps는 사용할 수 있는 Google maps의 객체
    map.panTo(new google.maps.LatLng(driverCoords.lat, driverCoords.lng));
    // panTo는 지도의 중심을 지정된 LatLng로 변경
    setMap(map);
    setMaps(maps);
  };

  const makeRoute = () => {
    // 구글 API를 이용해서 어떻게 경로를 만드는지 보여줌
    if (map) {
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer();
      directionsRenderer.setMap(map);

      const customerLat = cookedOrdersData?.cookedOrders.customer?.gpsList?.lat;
      const customerLng = cookedOrdersData?.cookedOrders.customer?.gpsList?.lng;

      if (customerLat !== undefined && customerLng !== undefined) {
        const destination = new google.maps.LatLng(customerLat, customerLng);
        directionsService.route(
          // 주소없이 좌표만으로 경로 만드는 방법
          {
            origin: {
              location: new google.maps.LatLng(
                driverCoords.lat,
                driverCoords.lng
              ),
            },
            // destination: {
            //   location: new google.maps.LatLng(
            //     cookedOrdersData?.cookedOrders.customer?.gpsList?.lat,
            //     cookedOrdersData?.cookedOrders.customer?.gpsList?.lng
            //   ),
            // },
            destination: { location: destination },
            travelMode: google.maps.TravelMode.TRANSIT,
            // 국내에선 대중교통밖에 지원하지 않음.
          },
          (result) => {
            // 경로 그려주기
            directionsRenderer.setDirections(result);
          }
        );
      }
    } else {
      console.error("Map is not available.");
    }
  };

  useEffect(() => {
    if (cookedOrdersData?.cookedOrders?.id) {
      makeRoute();
    }
  });

  const history = useHistory();

  // 배달원 지정
  const onCompleted = (data: TakeOrderMutation) => {
    if (data.takeOrder.ok) {
      history.push(`/orders/${cookedOrdersData?.cookedOrders.id}`);
    }
  };
  const [takeOrderMutation] = useMutation<
    TakeOrderMutation,
    TakeOrderMutationVariables
  >(TAKE_ORDER_MUTATION, {
    onCompleted,
  });
  const triggerMutation = (orderId: number) => {
    takeOrderMutation({
      variables: {
        input: {
          id: orderId,
        },
      },
    });
  };
  return (
    <div>
      <Helmet>
        <title>Dashboard | Nuber Eats</title>
      </Helmet>
      <div
        className="overflow-hidden"
        style={{ width: window.innerWidth, height: "50vh" }}
      >
        <GoogleMapReact
          bootstrapURLKeys={{ key: `${process.env.REACT_APP_GOOGLE_API}` }}
          yesIWantToUseGoogleMapApiInternals // 내 좌표로 지도를 이동시킴
          onGoogleApiLoaded={onApiLoaded} // 우리에게 map을 줌
          defaultZoom={16}
          defaultCenter={{
            lat: 36.53,
            lng: 125.64,
          }}
        >
          <Driver lat={driverCoords.lat} lng={driverCoords.lng} />
        </GoogleMapReact>
      </div>
      {/* 오더 그리드 */}
      <div className=" max-w-screen-sm mx-auto bg-white relative -top-10 shadow-lg py-8 px-5">
        {cookedOrdersData?.cookedOrders.restaurant ? (
          <>
            <h1 className="text-center  text-3xl font-medium">
              New Coocked Order
            </h1>
            <h1 className="text-center my-3 text-2xl font-medium">
              Pick it up soon @{" "}
              {cookedOrdersData?.cookedOrders.restaurant?.name}
            </h1>

            <button
              onClick={() => triggerMutation(cookedOrdersData?.cookedOrders.id)}
              className="btn w-full  block  text-center mt-5"
            >
              Accept Challenge &rarr;
            </button>
          </>
        ) : (
          <h1 className="text-center  text-3xl font-medium">
            No orders yet...
          </h1>
        )}
      </div>
    </div>
  );
};
