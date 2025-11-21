import { Toaster } from "sonner";
import { BrowserRouter, Route, Routes } from "react-router";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SchedulePage from "./pages/SchedulePage";
import VenuesFindingPage from "./pages/VenuesFindingPage";
import PreferencePage from "./pages/PreferencePage";
import MessagePage from "./pages/MessagePage";
import NotFoundPage from "./pages/NotFoundPage";
import { useAuthStore } from "./stores/useAuthStore";
import { useSocketStore } from "./stores/useSocketStore";
import { useEffect } from "react";

function App() {

  const {token} = useAuthStore();
  const {connectSocket, disconnectSocket} = useSocketStore();

  useEffect(() => {
    if (token) {
      connectSocket();
    }
    return () => disconnectSocket();
  }, [token]);

  return (
    <>
      <Toaster richColors />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

					{/* Protected Routes */}
					<Route element={<ProtectedRoute />}>
						<Route path='/' element={<HomePage />} />
						<Route
							path='/SchedulePage'
							element={<SchedulePage />}
						/>
						<Route
							path='/VenuesFindingPage'
							element={<VenuesFindingPage />}
						/>
						<Route
							path='/PreferencePage'
							element={<PreferencePage />}
						/>
						<Route path='/MessagePage' element={<MessagePage />} />
					</Route>

					<Route path='*' element={<NotFoundPage />} />
				</Routes>
			</BrowserRouter>
		</>
	);
}

export default App;
