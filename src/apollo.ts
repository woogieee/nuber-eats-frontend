import { ApolloClient, InMemoryCache, makeVar } from "@apollo/client";

export const isLoggedInVar = makeVar(false);

export const client = new ApolloClient({
  name: "nuber-eats-backend",
  uri: "http://localhost:4000/graphql",
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
        },
      },
    },
  }),
});
