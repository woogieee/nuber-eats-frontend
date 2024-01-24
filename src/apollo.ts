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
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

const token = localStorage.getItem(LOCALSTORAGE_TOKEN);
export const isLoggedInVar = makeVar(Boolean(token));
export const authTokenVar = makeVar(token);

// WebSocket link 설정
const wsLink = new GraphQLWsLink(
  createClient({
    url:
      process.env.NODE_ENV === "production"
        ? "wss://nuber-eats-backend.onrender.com/graphql"
        : `ws://localhost:4000/graphql`,
    connectionParams: {
      "x-jwt": authTokenVar() || "",
    },
  })
);

// HTTP link 설정
const httpLink = createHttpLink({
  uri:
    process.env.NODE_ENV === "production"
      ? "https://nuber-eats-backend.onrender.com/graphql"
      : "http://localhost:4000/graphql",
});

// Auth link 설정 (헤더에 "x-jwt" 추가)
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
// Apollo Client 생성
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
