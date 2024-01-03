describe("Log In", () => {
  const user = cy;
  // 로그인 페이지 열기
  it("should see login page", () => {
    user.visit("/").title().should("eq", "Login | Nuber Eats");
  });
  // 이메일 입력 오류시 오류문구 "please enter a valid email" 정상 출력 되는지
  it("can see email / password validation errors", () => {
    user.visit("/");
    user.findByPlaceholderText(/email/i).type("bad@email");
    user.findByRole("alert").should("have.text", "please enter a valid email");
    user.findByPlaceholderText(/email/i).clear();
    user.findByRole("alert").should("have.text", "Email is required");
    // 정상 이메일 입력
    user.findByPlaceholderText(/email/i).type("bad@email.com");
    user
      .findByPlaceholderText(/password/i)
      .type("a")
      .clear();
    user.findByRole("alert").should("have.text", "Password is required");
  });
  // 폼 입력, 로그인
  it("can fill out the form and log in", () => {
    user.login("test01@test.com", "a123456789!");
  });
});
