import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate, useLocation, Link } from "react-router";
import { useRef, useState, useEffect } from "react";

import IconButton from "@mui/joy/IconButton";

import {
	Favorite,
	Work,
	ExpandMore,
	Person,
	Settings,
	Logout,
	ChevronRight,
} from "@mui/icons-material";

function Navbar() {
	const { userProfile, logout } = useAuthStore();
	const navigate = useNavigate();
	const location = useLocation();

	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const userMenuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				userMenuRef.current &&
				!userMenuRef.current.contains(event.target as Node)
			) {
				setUserMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleLogout = async () => {
		try {
			await logout();
			navigate("/login");
		} catch (error) {
			console.log("Logout Failed:", error);
		}
	};

	// Generate breadcrumbs from current path
	const getBreadcrumbs = () => {
		const paths = location.pathname.split("/").filter(Boolean);

		// Map of routes to display names
		const routeNames: Record<string, string> = {
			"": "Home",
			profile: "Profile",
			settings: "Settings",
			message: "Messages",
			schedule: "Schedule",
			venues: "Venues",
			preferences: "Preferences",
		};

		const breadcrumbs = [{ name: "Home", path: "/" }];

		let currentPath = "";
		paths.forEach((path) => {
			currentPath += `/${path}`;
			const name =
				routeNames[path] ||
				path.charAt(0).toUpperCase() + path.slice(1);
			breadcrumbs.push({ name, path: currentPath });
		});

		return breadcrumbs;
	};

	const breadcrumbs = getBreadcrumbs();

	return (
		<>
			<nav className='bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50'>
				<div className='max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4'>
					<div className='flex items-center justify-between relative'>
						{/* BREADCRUMBS - Left */}
						<div className='flex items-center gap-1 sm:gap-2 min-w-0'>
							{breadcrumbs.map((crumb, index) => (
								<div
									key={crumb.path}
									className='flex items-center gap-1 sm:gap-2'
								>
									{index > 0 && (
										<ChevronRight
											sx={{
												fontSize: {
													xs: "0.875rem",
													sm: "1rem",
												},
												color: "#9ca3af",
											}}
										/>
									)}
									<Link
										to={crumb.path}
										className={`text-xs sm:text-sm font-medium transition-colors hover:text-purple-600 truncate ${
											index === breadcrumbs.length - 1
												? "text-purple-600 font-semibold"
												: "text-gray-500"
										}`}
									>
										{crumb.name}
									</Link>
								</div>
							))}
						</div>

						{/* WEB TITLE - Center */}
						<div className='absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 sm:gap-4 pointer-events-none'>
							<div className='flex items-center gap-1 sm:gap-2'>
								<Work
									sx={{
										color: "brown",
										fontSize: {
											xs: "1rem",
											sm: "1.5rem",
											md: "2rem",
											lg: "2.5rem",
										},
									}}
								/>
								<h1 className='text-[0.6rem] sm:text-xs md:text-base lg:text-lg xl:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent whitespace-nowrap'>
									THE RIGHT TYPE
								</h1>
								<Favorite
									sx={{
										color: "pink",
										fontSize: {
											xs: "1rem",
											sm: "1.5rem",
											md: "2rem",
											lg: "2.5rem",
										},
									}}
								/>
							</div>
						</div>

						{/* USER INFO & LOGOUT - Right */}
						<div className='relative' ref={userMenuRef}>
							<button
								onClick={() => setUserMenuOpen(!userMenuOpen)}
								className='flex flex-row items-center gap-1 hover:opacity-80 transition-opacity'
							>
								{/* USER AVATAR */}
								{userProfile?.avatarUrl && (
									<img
										src={userProfile.avatarUrl}
										alt='Profile Picture'
										className='w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-full border-2 border-purple-400'
									/>
								)}
								<ExpandMore
									sx={{
										fontSize: {
											xs: "1rem",
											sm: "1.2rem",
											md: "1.5rem",
										},
										transition: "transform 0.2s",
										transform: userMenuOpen
											? "rotate(180deg)"
											: "rotate(0deg)",
									}}
								/>
							</button>

							{/* Dropdown Menu */}
							{userMenuOpen && (
								<div className='absolute right-0 mt-2 w-60 bg-white rounded-[16px] shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] border border-slate-200 py-2 animate-fadeIn'>
									{/* User Information */}
									<div className='px-4 py-3 border-b border-gray-200'>
										<p className='font-bold text-gray-800'>
											{userProfile?.displayName}
										</p>
										<p className='text-sm text-gray-600 truncate'>
											{userProfile?.email}
										</p>
									</div>

									{/* Menu Items */}
									<div className='py-2'>
										{/* User Profile Button */}
										<Link
											to='/ProfilePage'
											onClick={() =>
												setUserMenuOpen(false)
											}
											className='flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors'
											style={{
												textDecoration: "none",
											}}
										>
											<Person
												sx={{ fontSize: "1.25rem" }}
											/>
											<span className='text-sm font-medium'>
												My Profile
											</span>
										</Link>

										{/* Settings Button */}
										<Link
											to='/SettingsPage'
											onClick={() =>
												setUserMenuOpen(false)
											}
											className='flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors'
											style={{
												textDecoration: "none",
											}}
										>
											<Settings
												sx={{ fontSize: "1.25rem" }}
											/>
											<span className='text-sm font-medium'>
												Settings
											</span>
										</Link>
									</div>

									{/* Logout Button */}
									<div className='border-t border-gray-200 pt-2'>
										<button
											onClick={() => handleLogout()}
											className='w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 hover:cursor-pointer transition-colors'
										>
											<Logout
												sx={{ fontSize: "1.25rem" }}
											/>
											<span className='text-sm font-medium'>
												Logout
											</span>
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</nav>
		</>
	);
}

export default Navbar;
