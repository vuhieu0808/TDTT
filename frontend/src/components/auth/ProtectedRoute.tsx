import { use } from "react";
import { useAuthStore } from "../../stores/useAuthStore";
import { Navigate, Outlet } from "react-router";

const ProtectedRoute = () => {
  console.log("ProtectedRoute rendered");
  const { user, loading } = useAuthStore();
  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
