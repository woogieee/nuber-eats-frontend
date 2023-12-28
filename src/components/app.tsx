import { LoggedOutRouter } from "../routers/logged-out-router";
import { useReactiveVar } from "@apollo/client";
import { LoggedInRouter } from "../routers/logged-in-router";
import { isLoggedInVar } from "../apollo";

export const App = () => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  return isLoggedIn ? <LoggedInRouter /> : <LoggedOutRouter />;
};
