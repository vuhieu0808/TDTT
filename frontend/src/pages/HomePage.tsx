import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router";
import Navbar from "@/components/Navbar";
import Button from "@mui/joy/Button";
import Footer from "@/components/Footer";
import Layout from '@/components/Layout'

const HomePage = () => {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();

  const handleScheduleClick = () => {
    navigate('/SchedulePage');
  };

  const handleMatchingClick = () => {
    // TODO: Navigate to matching page
    console.log("Navigate to matching");
  };

  const handleVenuesClick = () => {
    // TODO: Navigate to venues page
    console.log("Navigate to venues");
  };

  const handlePreferencesClick = () => {
    // TODO: Navigate to preferences page
    console.log("Navigate to preferences");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <Layout>
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome back, {authUser?.displayName?.split(" ")[0]}! 👋
            </h2>
            <p className="text-lg text-gray-600 mb-2">
              Find your type, while you type
            </p>
            <p className="text-sm text-gray-500">
              Balance work productivity and emotional connection
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Availability Matching */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 flex flex-col h-full">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-3xl">📅</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                Set Availability
              </h3>
              <p className="text-sm text-gray-600 mb-6 text-center flex-grow">
                Sync your schedule for perfect work-date matching
              </p>
              <Button
                onClick={handleScheduleClick}
                sx={{
                  width: "100%",
                  backgroundColor: "#a855f7",
                  color: "white",
                  textTransform: "none",
                  padding: "10px 20px",
                  "&:hover": {
                    backgroundColor: "#9333ea",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(168, 85, 247, 0.4)"
                  },
                  transition: "all 0.3s ease"
                }}
              >
                Update Schedule
              </Button>
            </div>

            {/* Find Matches */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 flex flex-col h-full">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-3xl">💝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                Find Matches
              </h3>
              <p className="text-sm text-gray-600 mb-6 text-center flex-grow">
                Connect with verified users on compatible schedules
              </p>
              <Button
                onClick={handleMatchingClick}
                sx={{
                  width: "100%",
                  backgroundColor: "#ec4899",
                  color: "white",
                  textTransform: "none",
                  padding: "10px 20px",
                  "&:hover": {
                    backgroundColor: "#db2777",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(236, 72, 153, 0.4)"
                  },
                  transition: "all 0.3s ease"
                }}
              >
                Start Matching
              </Button>
            </div>

            {/* Coffee Shop Finder */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 flex flex-col h-full">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-3xl">☕</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                Find Venues
              </h3>
              <p className="text-sm text-gray-600 mb-6 text-center flex-grow">
                Discover work-friendly spots with honest reviews
              </p>
              <Button
                onClick={handleVenuesClick}
                sx={{
                  width: "100%",
                  backgroundColor: "#f59e0b",
                  color: "white",
                  textTransform: "none",
                  padding: "10px 20px",
                  "&:hover": {
                    backgroundColor: "#d97706",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(245, 158, 11, 0.4)"
                  },
                  transition: "all 0.3s ease"
                }}
              >
                Browse Cafes
              </Button>
            </div>

            {/* Work Vibe Preferences */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 flex flex-col h-full">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                Work Vibe
              </h3>
              <p className="text-sm text-gray-600 mb-6 text-center flex-grow">
                Set your ideal work session preferences
              </p>
              <Button
                onClick={handlePreferencesClick}
                sx={{
                  width: "100%",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  textTransform: "none",
                  padding: "10px 20px",
                  "&:hover": {
                    backgroundColor: "#2563eb",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)"
                  },
                  transition: "all 0.3s ease"
                }}
              >
                Customize Vibe
              </Button>
            </div>
          </div>

          {/* Active Sessions / Matches Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Current Session */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Current Session</h3>
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">⏰</span>
                <p className="text-gray-600 mb-2">No active work-date session</p>
                <p className="text-sm text-gray-500 mb-6">
                  Start a synchronized work session with your match
                </p>
                <Button
                  sx={{
                    backgroundColor: "#a855f7",
                    color: "white",
                    textTransform: "none",
                    padding: "10px 30px",
                    "&:hover": { backgroundColor: "#9333ea" }
                  }}
                >
                  Start Session
                </Button>
              </div>
            </div>

            {/* Your Matches */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Matches</h3>
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">🔍</span>
                <p className="text-gray-600 mb-2">No matches yet</p>
                <p className="text-sm text-gray-500">
                  Complete your profile and set your availability to start matching!
                </p>
              </div>
            </div>
          </div>

        </div>
      </Layout>
    </div>
  );
};

export default HomePage;
