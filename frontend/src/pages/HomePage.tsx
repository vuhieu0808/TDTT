import { useAuthStore } from "@/stores/useAuthStore";
import Navbar from "@/components/Navbar";
import api from "@/lib/axios";
import Button from "@mui/joy/Button";

const HomePage = () => {
  const { authUser } = useAuthStore();

  const testAPI = async () => {
    try {
      const res = await api.get("/auth/test");
      console.log("API Response:", res.data);
    } catch (error) {
      console.error("Error testing API:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Navigation Bar */}
      <Navbar />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome back, {authUser?.displayName?.split(" ")[0]}! 👋
          </h2>
          <p className="text-lg text-gray-600">
            Ready to find your perfect work-date match?
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Facial Verification */}
          {/* <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 flex flex-col h-full">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <span className="text-3xl">📸</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
              Verify Profile
            </h3>
            <p className="text-sm text-gray-600 mb-6 text-center flex-grow">
              Complete facial verification to build trust
            </p>
            <Button
              sx={{
                width: "100%",
                backgroundColor: "#3b82f6",
                textTransform: "none",
                padding: "10px 20px",
                "&:hover": { backgroundColor: "#2563eb" },
              }}
            >
              Get Verified
            </Button>
          </div> */}

          {/* Availability Matching */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 flex flex-col h-full">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <span className="text-3xl">📅</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
              Set Availability
            </h3>
            <p className="text-sm text-gray-600 mb-6 text-center flex-grow">
              Match with people on your schedule
            </p>
            <Button
              sx={{
                width: "100%",
                backgroundColor: "#a855f7",
                textTransform: "none",
                padding: "10px 20px",
                "&:hover": { backgroundColor: "#9333ea" },
              }}
            >
              Update Schedule
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
              Discover perfect work-friendly spots
            </p>
            <Button
              sx={{
                width: "100%",
                backgroundColor: "#f59e0b",
                textTransform: "none",
                padding: "10px 20px",
                "&:hover": { backgroundColor: "#d97706" },
              }}
            >
              Browse Cafes
            </Button>
          </div>

          {/* Work Vibe Filters */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 flex flex-col h-full">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
              Set Preferences
            </h3>
            <p className="text-sm text-gray-600 mb-6 text-center flex-grow">
              Choose your ideal work vibe
            </p>
            <Button
              sx={{
                width: "100%",
                backgroundColor: "#ec4899",
                textTransform: "none",
                padding: "10px 20px",
                "&:hover": { backgroundColor: "#db2777" },
              }}
            >
              Customize Vibe
            </Button>
          </div>
        </div>

        {/* Current Matches Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Matches</h3>
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🔍</span>
            <p className="text-gray-600 mb-4">No matches yet</p>
            <p className="text-sm text-gray-500">
              Complete your profile and set your availability to start matching!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
