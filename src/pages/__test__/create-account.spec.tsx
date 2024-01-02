import { CREATE_ACCOUNT_MUTATION, CreateAccount } from "../create-account";
import { ApolloProvider } from "@apollo/client";
import { MockApolloClient, createMockClient } from "mock-apollo-client";
import {
  RenderResult,
  act,
  getByRole,
  render,
  screen,
  waitFor,
} from "../../test-utils";
import userEvent from "@testing-library/user-event";
import { UserRole } from "../../__generated__/graphql";

const mockPush = jest.fn();

jest.mock("react-router-dom", () => {
  // react-router-dom만 mock하기
  const realModule = jest.requireActual("react-router-dom");
  return {
    ...realModule,
    useHistory: () => {
      return {
        push: mockPush,
      };
    },
  };
});

describe("<CreateAccount />", () => {
  let mockedClient: MockApolloClient;
  let renderResult: RenderResult;
  beforeEach(async () => {
    await waitFor(() => {
      mockedClient = createMockClient();
      renderResult = render(
        <ApolloProvider client={mockedClient}>
          <CreateAccount />
        </ApolloProvider>
      );
    });
  });
  it("renders OK", async () => {
    await waitFor(() => {
      expect(document.title).toBe("Create Account | Nuber Eats");
    });
  });

  it("renders validation error", async () => {
    const email = screen.getByPlaceholderText(/email/i);
    const button = screen.getByRole("button");
    userEvent.type(email, "wont@work");
    // state가 바뀌는걸 기다리기 위해 waitFor 사용
    await waitFor(() => {
      let errorMessage = screen.getByRole("alert");
      expect(errorMessage).toHaveTextContent(/please enter a valid email/i);
    });
    userEvent.clear(email);
    await waitFor(() => {
      let errorMessage = screen.getByRole("alert");
      expect(errorMessage).toHaveTextContent(/email is required/i);
    });
    userEvent.type(email, "test01@test.com");
    userEvent.click(button);
    await waitFor(() => {
      let errorMessage = screen.getByRole("alert");
      expect(errorMessage).toHaveTextContent(/password is required/i);
    });
  });

  it("submits mutation with form values", async () => {
    const email = screen.getByPlaceholderText(/email/i);
    const password = screen.getByPlaceholderText(/password/i);
    const button = screen.getByRole("button");
    const formData = {
      email: "test01@test.com",
      password: "12",
      role: UserRole.Client,
    };
    const mockedLoginMutationResponse = jest.fn().mockResolvedValue({
      data: {
        createAccount: {
          ok: true,
          error: "mutation-error",
        },
      },
    });
    mockedClient.setRequestHandler(
      CREATE_ACCOUNT_MUTATION,
      mockedLoginMutationResponse
    );
    jest.spyOn(window, "alert").mockImplementation(() => null);
    await act(async () => {
      userEvent.type(email, formData.email);
      userEvent.type(password, formData.password);
      await waitFor(() => {
        userEvent.click(button);
      });
    });

    expect(mockedLoginMutationResponse).toHaveBeenCalledTimes(1);
    expect(mockedLoginMutationResponse).toHaveBeenCalledWith({
      createAccountInput: {
        email: formData.email,
        password: formData.password,
        role: formData.role,
      },
    });
    expect(window.alert).toHaveBeenCalledWith("Account Created! Log in now!");
    const mutationError = screen.getByRole("alert");
    expect(mockPush).toHaveBeenCalledWith("/");
    expect(mutationError).toHaveTextContent("mutation-error");
  });
  // 바꾼게 있다면 다시 원상태로 돌림
  afterAll(() => {
    jest.clearAllMocks();
  });
});
