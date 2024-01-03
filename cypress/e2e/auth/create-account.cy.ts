describe("Create Account", () => {
  const user = cy;
  // 이메일 입력, 비밀번호 미입력 테스트
  it("should see email / password validation errors", () => {
    user.visit("/");
    user.findByText(/create an account/i).click();
    user.findByPlaceholderText(/email/i).type("non@good");
    user.findByRole("alert").should("have.text", "please enter a valid email");
    user.findByPlaceholderText(/email/i).clear();
    user.findByRole("alert").should("have.text", "Email is required");
    user.findByPlaceholderText(/email/i).type("test01@test.com");

    user
      .findByPlaceholderText(/password/i)
      .type("a")
      .clear();
    user.findByRole("alert").should("have.text", "Password is required");
  });
  // 회원가입
  it("should be able to create account and login", () => {
    // 회원가입 정보 인터셉트
    user.intercept("http://localhost:4000/graphql", (req) => {
      const { operationName } = req.body;
      if (operationName && operationName === "createAccount") {
        req.reply((res) => {
          res.send({
            fixture: "auth/create-account.json",
          });
        });
      }
    });

    user.visit("/create-account");
    user.findByPlaceholderText(/email/i).type("test01@test.com");
    user.findByPlaceholderText(/password/i).type("a123456789!");
    user.findByRole("button").click();
    user.wait(1000);
    user.login("test01@test.com", "a123456789!");
  });
});
