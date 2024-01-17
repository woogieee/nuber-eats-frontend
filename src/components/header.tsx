import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMe } from "../hooks/useMe";
import nuberLogo from "../images/logo.svg";
import { faRightToBracket, faUser } from "@fortawesome/free-solid-svg-icons";
import { Link, useHistory } from "react-router-dom";
import { LOCALSTORAGE_TOKEN } from "../constants";
import { authTokenVar, isLoggedInVar } from "../apollo";
import { useApolloClient } from "@apollo/client";

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
