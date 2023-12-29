import { render, screen, waitFor } from "@testing-library/react";
import { Login } from "../login";
import { ApolloProvider } from "@apollo/client";
import { createMockClient } from "mock-apollo-client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter as Router } from "react-router-dom";
import userEvent from "@testing-library/user-event";

describe("<Login />", () => {
  beforeEach(() => {
    // graphql에서 클라이언트가 필요하기 때문에 생성
    const mockedClient = createMockClient();
    render(
      <HelmetProvider>
        <Router>
          <ApolloProvider client={mockedClient}>
            <Login />
          </ApolloProvider>
        </Router>
      </HelmetProvider>
    );
  });

  it("should render OK", async () => {
    await waitFor(() => {
      expect(document.title).toBe("Login | Nuber Eats");
    });
  });

  // 이메일
  it("displays email validation errors", async () => {
    const email = screen.getByPlaceholderText(/email/i);
    userEvent.type(email, "this@wont");

    await waitFor(() => {
      const errorMessage = screen.getByRole("alert");
      expect(errorMessage).toHaveTextContent(/please enter a valid email/i);
    });
    userEvent.clear(email);

    await waitFor(() => {
      const errorMessage = screen.getByRole("alert");
      expect(errorMessage).toHaveTextContent(/email is required/i);
    });
  });

  // 비밀번호
  it("display password required errors", async () => {
    const email = screen.getByPlaceholderText(/email/i);
    userEvent.type(email, "test01@test.com");

    await waitFor(() => {
      const submitBtn = screen.getByRole("button");
      expect(submitBtn).toHaveTextContent("Log in");
    });
    userEvent.click(submitBtn);

    screen.debug();
  });
});
