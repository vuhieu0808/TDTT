import { useAuthStore } from "../../stores/useAuthStore";
import { Navigate, Outlet } from "react-router";
import Loading from "../Loading";

const ProtectedRoute = () => {
	const { userProfile, loading } = useAuthStore();
	if (loading) {
    return <Loading />;
  }
	if (userProfile) {
		return <Navigate to='/' replace />;
	}
	return <Outlet />;
};

export default ProtectedRoute;
