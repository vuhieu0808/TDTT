import { useAuthStore } from "../../stores/useAuthStore";
import { Navigate, Outlet } from "react-router";

const ProtectedRoute = () => {
	const { userProfile, loading } = useAuthStore();
	if (loading) {
		return <div>Loading...</div>;
	}
	if (userProfile) {
		return <Navigate to='/' replace />;
	}
	return <Outlet />;
};

export default ProtectedRoute;
