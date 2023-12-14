import { isLoggedInVar } from "../apollo";

// 로그인 상태 확인
export const LoggedInRouter = () => (
  <div>
    <h1>Logged In</h1>
    <button onClick={() => isLoggedInVar(false)}>Log Out</button>
  </div>
);
