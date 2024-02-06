import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMe } from "../hooks/useMe";
import nuberLogo from "../images/logo.svg";
import {
  faLocationDot,
  faRightToBracket,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useHistory } from "react-router-dom";
import { LOCALSTORAGE_TOKEN } from "../constants";
import { authTokenVar, isLoggedInVar } from "../apollo";
import { gql, useApolloClient, useMutation } from "@apollo/client";
import {
  UpdateUserGpsMutation,
  UpdateUserGpsMutationVariables,
} from "../__generated__/graphql";

const UPDATE_USER_GPS_MUTATION = gql`
  mutation updateUserGPS($input: UpdateUserGPSInput!) {
    updateUserGPS(input: $input) {
      ok
      error
    }
  }
`;

export const Header: React.FC = () => {
  const { data } = useMe();
  const history = useHistory();
  const client = useApolloClient();
  const logout = () => {
    localStorage.removeItem(LOCALSTORAGE_TOKEN);
    authTokenVar(null);
    isLoggedInVar(false);
    // Apollo Client 캐시 지우기
    client.clearStore();
    history.push("/");
  };

  const [updateUserGPSMutation] = useMutation<
    UpdateUserGpsMutation,
    UpdateUserGpsMutationVariables
  >(UPDATE_USER_GPS_MUTATION);

  const getGps = () => {
    // Geolocation API가 지원되는지 확인
    if (navigator.geolocation) {
      // 사용자의 현재 위치 가져오기
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // 확인 창 띄우기
          const userConsent = window.confirm("현재 위치를 저장하시겠습니까?");

          // 사용자가 확인을 선택한 경우에만 위치 저장
          if (userConsent) {
            updateUserGPSMutation({
              variables: {
                input: {
                  userId: data?.me.id!,
                  lat: latitude,
                  lng: longitude,
                },
              },
            });
            alert("위치가 저장되었습니다.");
          } else {
            alert("사용자가 위치 저장을 취소했습니다.");
          }
        },
        (error) => {
          console.error("GPS 좌표를 가져오는 중 오류 발생:", error.message);
        }
      );
    } else {
      console.error("이 브라우저에서는 Geolocation이 지원되지 않습니다.");
    }
  };
  return (
    <>
      {!data?.me.verified && (
        <div className=" bg-red-500 p-3 text-center text-base text-white">
          <span>Please verify your email.</span>
        </div>
      )}
      <header className=" py-4">
        {/* tailwind css는 class 모바일 우선적용 css */}
        <div className="w-full px-5 xl:px-0 max-w-screen-xl mx-auto flex justify-between items-center">
          <Link to="/">
            <img src={nuberLogo} alt="Nuber Eats" className="w-36" />
          </Link>
          <span className="text-xs">
            {/* gps 버튼 시작 */}
            {data?.me.role === "Client" && (
              <button onClick={getGps} className=" pl-2">
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="text-xl mr-4"
                />
              </button>
            )}
            {/* gps 버튼 종료 */}
            <Link to="/edit-profile">
              <FontAwesomeIcon icon={faUser} className="text-xl" />
            </Link>
            <button onClick={logout} className=" pl-2">
              <FontAwesomeIcon
                icon={faRightToBracket}
                className="text-xl ml-1"
              />
            </button>
          </span>
        </div>
      </header>
    </>
  );
};
