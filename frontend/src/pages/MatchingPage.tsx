import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/stores/useAuthStore";
import Navbar from "@/components/Navbar";
import { matchingServices } from "@/services/matchingServices";
import type { MatchScore } from "@/types/match";
import { friendServices } from "@/services/friendServices";
import type { UserProfile } from "@/types/user.ts";

import {
  Favorite,
  LocationOn,
  Psychology,
  Info,
  Clear,
} from "@mui/icons-material";
import { useFriendStore } from "@/stores/useFriendStore";

function MatchingPage() {
  const { userProfile } = useAuthStore();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<
    "left" | "right" | null
  >(null);

  // Add state for matches from backend
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { swipeLeft, swipeRight } = useFriendStore();

  // Fetch matches from backend on component mount
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setIsLoading(true);
        const response = await matchingServices.getMatches(10);

        console.log("Matches from backend:", response);

        const matchesArray = Object.entries(response).map(([key, value]) => {
          return {
            id: key,
            ...value,
          };
        });

        console.log(typeof response);

        // Transform backend data to match your UI format
        if (matchesArray && matchesArray.length > 0) {
          const transformedMatches = matchesArray.map(
            (match: MatchScore): UserProfile => ({
              uid: match.user.uid,
              displayName: match.user.displayName,
              email: match.user.email,
              avatarUrl: match.user.avatarUrl || "https://i.pravatar.cc/400",
              bio: match.user.bio || "No bio available",
              interests: match.user.interests || [],
              workVibe: match.user?.workVibe || undefined,
              status: "online",
              lastActivity: new Date().toISOString(),
              // matchPercentage: Math.round(match.totalScore * 100),
              createdAt: match.user?.createdAt,
              updatedAt: match.user?.updatedAt,
              isReadyToMatch: match.user.isReadyToMatch,
            })
          );

          setMatches(transformedMatches);
        }
      } catch (error) {
        console.error("Failed to fetch matches:", error);

        // Keep using mock data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const currentMatch = matches[currentIndex];
  const hasMoreMatches = currentIndex < matches.length - 1;

  const handleReject = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setAnimationDirection("left");

    setTimeout(() => {
      console.log("Rejected: ", currentMatch.displayName);
			swipeLeft(currentMatch.uid);
      if (hasMoreMatches) {
        setCurrentIndex(currentIndex + 1);
        // friendServices.swipeLeft(currentMatch.uid);
      } else {
        setCurrentIndex(0);
      }
      setIsAnimating(false);
      setAnimationDirection(null);
    }, 400);
  };

  const handleAccept = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setAnimationDirection("right");

    setTimeout(() => {
      console.log("Matched with:", currentMatch.displayName);
			swipeRight(currentMatch.uid);
      if (hasMoreMatches) {
        setCurrentIndex(currentIndex + 1);
        // friendServices.swipeRight(currentMatch.uid);
      } else {
        setCurrentIndex(0);
      }
      setIsAnimating(false);
      setAnimationDirection(null);
    }, 400);
  };

  // Show loading state
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[90vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Finding Your Perfect Matches...
            </h2>
          </div>
        </div>
      </>
    );
  }

  if (!currentMatch) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[90vh]">
          <div className="text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              No More Matches!
            </h2>
            <p className="text-gray-600 mb-6">
              You've reviewed all available matches. Check back later for more!
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      {/* Main Container */}
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-4 gap-6 overflow-hidden">
        {/* User Card */}
        <div
          className={`w-full max-w-5xl h-[73vh] bg-white rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] border border-gray-200 overflow-hidden flex transition-all duration-400 ${
            isAnimating
              ? animationDirection === "left"
                ? "opacity-0 -translate-x-full rotate-[-12deg]"
                : "opacity-0 translate-x-full rotate-[12deg]"
              : "opacity-100 translate-x-0 rotate-0"
          }`}
        >
          {/* Left Side - User Picture */}
          <div className="w-2/5 relative bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-80 h-80 rounded-full overflow-hidden border-8 border-white shadow-2xl">
                <img
                  src={currentMatch.avatarUrl}
                  alt={currentMatch.displayName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Online Status Indicator */}
              <div className="absolute bottom-6 right-6 w-8 h-8 bg-green-500 border-4 border-white rounded-full shadow-lg"></div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-10 right-10 w-20 h-20 bg-purple-300/30 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 left-10 w-32 h-32 bg-pink-300/30 rounded-full blur-xl"></div>
          </div>

          {/* Right Side - User Information */}
          <div className="w-3/5 p-8 overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {currentMatch.displayName}
                </h1>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-purple-50 rounded-full transition-colors">
                    <Info className="text-purple-600" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 flex items-center gap-2">
                <LocationOn
                  sx={{
                    fontSize: "1.25rem",
                    color: "#ec4899",
                  }}
                />
                {currentMatch.email}
              </p>
            </div>

            {/* Bio */}
            <div className="mb-6 p-4 bg-purple-50 rounded-2xl">
              <p className="text-gray-700 text-sm leading-relaxed">
                {currentMatch.bio}
              </p>
            </div>

            {/* Interests Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Favorite
                  sx={{
                    fontSize: "1.5rem",
                    color: "#a855f7",
                  }}
                />
                <h2 className="text-xl font-bold text-gray-800">Interests</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentMatch.interests &&
                  currentMatch?.interests.map(
                    (interest: string, index: number) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200"
                      >
                        {interest}
                      </span>
                    )
                  )}
              </div>
            </div>

            {/* Working Mode */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Psychology
                  sx={{
                    fontSize: "1.5rem",
                    color: "#a855f7",
                  }}
                />
                <h2 className="text-xl font-bold text-gray-800">
                  Working Mode
                </h2>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white">
                <p className="text-lg font-semibold capitalize">
                  {/* {currentMatch.workVibe} */}
                </p>
                <p className="text-sm opacity-90 mt-1">
                  {currentMatch.workVibe === "balanced" &&
                    "Perfect balance of productivity and collaboration"}
                  {currentMatch.workVibe === "creative-chat" &&
                    "Collaborative brainstorming and idea sharing"}
                  {currentMatch.workVibe === "deep-work" &&
                    "Focused work with strategic breaks"}
                  {currentMatch.workVibe === "quiet-focus" &&
                    "Minimal conversation, maximum productivity"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Below Card */}
        <div className="flex items-center gap-6">
          {/* Reject Button */}
          <button
            onClick={handleReject}
            disabled={isAnimating}
            className="p-5 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-full shadow-xl transition-all hover:scale-110 group"
          >
            <Clear
              sx={{
                fontSize: "2.5rem",
                color: "#ef4444",
                transition: "all 0.3s",
              }}
              className="group-hover:rotate-90"
            />
          </button>

          {/* Accept Button */}
          <button
            onClick={handleAccept}
            disabled={isAnimating}
            className="p-5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 rounded-full shadow-xl transition-all hover:scale-110 group"
          >
            <Favorite
              sx={{
                fontSize: "2.5rem",
                color: "white",
                transition: "all 0.3s",
              }}
              className="group-hover:scale-125"
            />
          </button>
        </div>
      </div>
    </>
  );
}

export default MatchingPage;
