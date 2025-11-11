import { useAuthStore } from "../../stores/useAuthStore";
import { Navigate, Outlet } from "react-router";

const ProtectedRoute = () => {
  const { authUser, loading } = useAuthStore();
  if (loading) {
    return <div>Loading...</div>;
  }
  if (authUser) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
