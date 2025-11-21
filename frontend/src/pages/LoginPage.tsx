import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router";
import Button from "@mui/joy/Button"
import GoogleLogo from "@/assets/logo/google-logo.svg"

const LoginPage = () => {
  const { signInWithGoogle } = useAuthStore();
  const navigate = useNavigate();
  const onLogin = async () => {
    try {
      await signInWithGoogle();
      navigate("/");
    } catch (error) {
      console.log("Login failed: ", error);
    }
  };

  return (
    <div className="w-full h-screen min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-20 -left-20 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl bottom-20 -right-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center bg-white/10 backdrop-blur-xl p-12 rounded-3xl shadow-2xl max-w-md w-full mx-4 border border-white/20">
        {/* Logo/Brand Section */}
        <div className="pb-10 flex flex-col justify-center items-center text-center">
          <div className="mb-4 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">💼</span>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-red-400 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">❤️</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">THE RIGHT TYPE</h1>
          <p className="text-lg text-gray-300 font-light">find your type while you type</p>
          <p className="text-sm text-gray-400 mt-4 max-w-xs">
            Where productivity meets connection. Work together, grow together.
          </p>
        </div>

        {/* Sign In Button */}
        <Button
          onClick={onLogin}
          sx={{
            width: '100%',
            color: 'black',
            backgroundColor: 'white',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 600,
            borderRadius: '12px',
            textTransform: 'none',
            boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)',
            '&:hover': {
              backgroundColor: '#f5f5f5',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px 0 rgba(0,0,0,0.15)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <img src={GoogleLogo} className="w-6 h-6 mr-3" alt="Google logo"></img>
          Sign in with Google
        </Button>

        {/* Features Preview */}
        <div className="mt-8 pt-8 border-t border-white/10 w-full">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-1">✓</span>
              <span className="text-xs text-gray-300">Verified Profiles</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-1">📅</span>
              <span className="text-xs text-gray-300">Smart Matching</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-1">☕</span>
              <span className="text-xs text-gray-300">Venue Finder</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-1">🎯</span>
              <span className="text-xs text-gray-300">Work Vibes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
