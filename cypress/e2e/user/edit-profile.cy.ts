describe("Edit Profile", () => {
  const user = cy;
  beforeEach(() => {
    user.login("test01@test.com", "a123456789!");
  });
  // 로그인 후 프로필 수정 페이지 이동 테스트
  it("can go to /edit-profile using the header", () => {
    user.get('a[href="/edit-profile"]').click();
    user.assertTitle("Edit Profile");
  });

  // 이메일 변경 테스트
  it("can change email", () => {
    // 응답 가로채기
    user.intercept("POST", "http://localhost:4000/graphql", (req) => {
      if (req.body?.operationName === "editProfile") {
        req.body.variables.input.email = "test01@test.com";
      }
    });
    user.visit("/edit-profile");
    user.findByPlaceholderText(/email/i).clear().type("new01@test.com");
    user.findByRole("button").click();
  });
});
