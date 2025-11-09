import { useAuthStore } from "../../stores/useAuthStore";
import { Navigate, Outlet } from "react-router";

const ProtectedRoute = () => {
  const { user, loading } = useAuthStore();
  if (loading) {
    return <div>Loading...</div>;
  }
  if (user) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
