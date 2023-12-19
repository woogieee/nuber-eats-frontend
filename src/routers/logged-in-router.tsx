import {
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch,
} from "react-router-dom";
import { Restaurants } from "../pages/client/restaurants";
import { Header } from "../components/header";
import { useMe } from "../hooks/useMe";
import { NotFound } from "../pages/404";
import { ConfirmEmail } from "../pages/user/confirm-email";

// Client Router
// fragment - parent 없이 많은 element를 동시에 return 할 수 있음
const ClientRoutes = [
  <Route key={1} path="/" exact>
    <Restaurants />
  </Route>,
  <Route key={2} path="/confirm" exact>
    <ConfirmEmail />
  </Route>,
];

export const LoggedInRouter = () => {
  const { data, loading, error } = useMe();
  // 데이터가 없거나, 로딩중이거나, 에러가 있으면
  if (!data || loading || error) {
    return (
      <div className=" h-screen flex justify-center items-center">
        <span className=" font-medium text-xl tracking-wide">Loading...</span>
      </div>
    );
  }
  return (
    <Router>
      <Header />
      <Switch>
        {data.me.role === "Client" && ClientRoutes}
        {/* <Redirect key="default" to="/" /> */}
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </Router>
  );
};
