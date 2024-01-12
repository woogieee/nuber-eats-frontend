import GoogleMapReact from "google-map-react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";

interface ICoords {
  lat: number;
  lng: number;
}

interface IDriverProps {
  lat: number;
  lng: number;
  $hover?: any;
}

// const AnyReactComponent = ({ text }) => <div>{text}</div>;
const Driver: React.FC<IDriverProps> = () => <div className="text-lg">🚘</div>;
export const Dashboard = () => {
  const [driverCoords, setDriverCoords] = useState<ICoords>({ lng: 0, lat: 0 });
  const [map, setMap] = useState<any>();
  const [maps, setMaps] = useState<any>();
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
      map.panTo(new maps.LatLng(driverCoords.lat, driverCoords.lng));
    }
  }, [driverCoords.lat, driverCoords.lng]);

  const onApiLoaded = ({ map, maps }: { map: any; maps: any }) => {
    // 이 함수를 통해서 map 객체와 상호작용
    // map과 maps의 차이점, map은 화면에 보이는 지도의 정보, maps는 사용할 수 있는 Google maps의 객체
    map.panTo(new maps.LatLng(driverCoords.lat, driverCoords.lng));
    // panTo는 지도의 중심을 지정된 LatLng로 변경
    setMap(map);
    setMaps(maps);
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
          yesIWantToUseGoogleMapApiInternals // 내 좌표로 지도를 이동시킴
          onGoogleApiLoaded={onApiLoaded} // 우리에게 map을 줌
          defaultZoom={16}
          defaultCenter={{
            lat: 36.53,
            lng: 125.64,
          }}
          bootstrapURLKeys={{ key: "AIzaSyDYYorr-DhUnSNrBZsvcnG7TqcdHvC9_J8" }}
        >
          <Driver lat={driverCoords.lat} lng={driverCoords.lng} />
        </GoogleMapReact>
      </div>
    </div>
  );
};
