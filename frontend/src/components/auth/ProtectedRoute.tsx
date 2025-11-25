import { useAuthStore } from "../../stores/useAuthStore";
import { Navigate, Outlet } from "react-router";
import Loading from "../Loading";

const ProtectedRoute = () => {
  console.log("ProtectedRoute rendered");
  const { userProfile, loading } = useAuthStore();
  if (loading) {
    return <Loading />;
  }
  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }

  return userProfile ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
