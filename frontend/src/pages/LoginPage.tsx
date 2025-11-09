import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router";

const LoginPage = () => {
  const { signInWithGoogle } = useAuthStore();
  const navigate = useNavigate();
  const onLogin = async () => {
    await signInWithGoogle();
    navigate("/");
  };
  return (
    <div>
      <h1>LoginPage</h1>
      <button onClick={onLogin}>Sign in with Google</button>
    </div>
  );
}

export default LoginPage;
