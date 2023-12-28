import { render, screen, waitFor } from "@testing-library/react";
import { Header } from "../header";
import { MockedProvider } from "@apollo/client/testing";
import { BrowserRouter as Router } from "react-router-dom";
import { ME_QUERY } from "../../hooks/useMe";

describe("<Header />", () => {
  it("renders verify banner", async () => {
    const mockedUserData = {
      id: 1,
      email: "",
      role: "",
      verified: false,
    };

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: ME_QUERY,
            },
            result: {
              data: {
                me: mockedUserData,
              },
            },
          },
        ]}
      >
        <Router>
          <Header />
        </Router>
      </MockedProvider>
    );

    // waitFor 함수로 비동기 작업을 기다림
    await waitFor(() => {
      // 텍스트가 존재하는지 확인할 때 getByText 사용
      screen.getByText("Please verify your email.");
    });
  });

  it("renders without verify banner", async () => {
    const mockedUserData = {
      id: 1,
      email: "",
      role: "",
      verified: true,
    };

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: ME_QUERY,
            },
            result: {
              data: {
                me: mockedUserData,
              },
            },
          },
        ]}
      >
        <Router>
          <Header />
        </Router>
      </MockedProvider>
    );

    // waitFor 함수로 비동기 작업을 기다림
    await waitFor(() => {
      // 텍스트가 존재하지 않는지 확인할 때는 queryBy 사용
      expect(screen.queryByText("Please verify your email.")).toBeNull();
    });
  });
});
