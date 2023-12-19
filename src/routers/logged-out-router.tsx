import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import { Login } from "../pages/login";
import { CreateAccount } from "../pages/create-account";
import { NotFound } from "../pages/404";

export const LoggedOutRouter = () => {
  return (
    <Router>
      {/* Switch - 한번에 route 하나만 render 해라 */}
      <Switch>
        <Route path="/create-account">
          <CreateAccount />
        </Route>
        <Route path="/" exact>
          <Login />
        </Route>
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </Router>
  );
};
