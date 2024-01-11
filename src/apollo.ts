import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  makeVar,
  split,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { LOCALSTORAGE_TOKEN } from "./constants";
import { getMainDefinition } from "@apollo/client/utilities";
import { WebSocketLink } from "@apollo/client/link/ws";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

const token = localStorage.getItem(LOCALSTORAGE_TOKEN);
export const isLoggedInVar = makeVar(Boolean(token));
export const authTokenVar = makeVar(token);

// ws
/*const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000/graphql`,
  options: {
    reconnect: true,
    connectionParams: {
      "x-jwt": authTokenVar() || "",
    },
  },
}); */
/*
const wsLink = new WebSocketLink(
  new SubscriptionClient("ws://localhost:4000/graphql", {
    connectionParams: {
      authToken: { "x-jwt": authTokenVar() || "" },
    },
    reconnect: true,
  })
);
*/
const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:4000/graphql",
    connectionParams: {
      authToken: { "x-jwt": authTokenVar() || "" },
    },
  })
);
const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql",
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      "x-jwt": authTokenVar() || "",
    },
  };
});
// transport
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(httpLink)
);
export const client = new ApolloClient({
  name: "nuber-eats-backend",
  // link: authLink.concat(httpLink),
  link: splitLink,
  connectToDevTools: true,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          isLoggedIn: {
            // read는 field의 값을 반환
            read() {
              return isLoggedInVar();
            },
          },
          token: {
            read() {
              return authTokenVar();
            },
          },
        },
      },
    },
  }),
});
