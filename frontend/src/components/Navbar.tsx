import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router";
import Button from "@mui/joy/Button"

function Navbar() {

    const { authUser, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    }

    return (<>
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">💼❤️</span>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            THE RIGHT TYPE
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        {authUser?.photoURL && (
                            <img
                                src={authUser.photoURL}
                                alt="Profile"
                                className="w-10 h-10 rounded-full border-2 border-purple-400"
                            />
                        )}
                        <span className="text-sm font-medium text-gray-700">
                            {authUser?.displayName}
                        </span>
                    </div>
                    <Button
                        onClick={handleLogout}
                        sx={{
                            backgroundColor: "white",
                            color: "#6366f1",
                            border: "1px solid #e5e7eb",
                            textTransform: "none",
                            fontWeight: 'bold',
                            "&:hover": {
                                backgroundColor: "#f9fafb",
                            },
                        }}
                    >
                        Log Out
                    </Button>
                </div>
            </div>
        </nav>
    </>)

}

export default Navbar;