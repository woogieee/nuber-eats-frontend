import { act, render, screen, waitFor } from "@testing-library/react";
import { Login, LOGIN_MUTATION } from "../login";
import { ApolloProvider } from "@apollo/client";
import { MockApolloClient, createMockClient } from "mock-apollo-client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter as Router } from "react-router-dom";
import userEvent from "@testing-library/user-event";

describe("<Login />", () => {
  let mockedClient: MockApolloClient;

  beforeEach(() => {
    // graphql에서 클라이언트가 필요하기 때문에 생성
    mockedClient = createMockClient();
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

  // 모든걸 잘 render 하는지 확인
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

  // 비밀번호 비어있는경우
  it("display password required errors", async () => {
    const email = screen.getByPlaceholderText(/email/i);
    const submitBtn = screen.getByRole("button");

    await act(async () => {
      userEvent.type(email, "test01@test.com");
      userEvent.click(submitBtn);
      await waitFor(() => {
        expect(submitBtn).toHaveTextContent("Log in");
      });
    });

    const errorMessage = screen.getByRole("alert");
    expect(errorMessage).toHaveTextContent(/password is required/i);
  });

  // 로그인 쿼리 접근
  it("submits form and calls mutation", async () => {
    const email = screen.getByPlaceholderText(/email/i);
    const password = screen.getByPlaceholderText(/password/i);
    const submitBtn = screen.getByRole("button");

    const formData = {
      email: "test01@test.com",
      password: "123",
    };
    const mockedMutationResponse = jest.fn().mockResolvedValue({
      data: {
        login: {
          ok: true,
          token: "xxx",
          error: "mutation-error",
        },
      },
    });
    mockedClient.setRequestHandler(LOGIN_MUTATION, mockedMutationResponse);
    jest.spyOn(Storage.prototype, "setItem");
    await act(async () => {
      userEvent.type(email, formData.email);
      userEvent.type(password, formData.password);
      await waitFor(() => {
        userEvent.click(submitBtn);
      });
    });
    expect(mockedMutationResponse).toHaveBeenCalledTimes(1);
    expect(mockedMutationResponse).toHaveBeenCalledWith({
      loginInput: {
        email: formData.email,
        password: formData.password,
      },
    });
    const errorMessage = screen.getByRole("alert");
    expect(errorMessage).toHaveTextContent(/mutation-error/i);
    expect(localStorage.setItem).toHaveBeenCalledWith("nuber-token", "xxx");
  });
});
