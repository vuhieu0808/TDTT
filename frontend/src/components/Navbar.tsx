import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate, useLocation } from "react-router";

import Button from "@mui/joy/Button";
import IconButton from "@mui/joy/IconButton";

import { ArrowBack, Favorite, Work } from "@mui/icons-material";

function Navbar() {
	const { userProfile, logout } = useAuthStore();
	const navigate = useNavigate();
	const location = useLocation();

	const handleLogout = async () => {
		await logout();
		navigate("/login");
	};

	const handleBack = () => {
		navigate(-1);
	};

	return (
		<>
			<nav className='bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50'>
				<div className='max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4'>
					<div className='grid grid-cols-[auto_1fr_auto] items-center gap-2'>
						{/* BACK BUTTON - Left */}
						<div className='flex justify-start'>
							{location.pathname !== "/" && (
								<IconButton
									onClick={handleBack}
									size='sm'
									sx={{
										fontSize: {
											xs: "1.2rem",
											sm: "1.5rem",
											md: "2rem",
										},
									}}
								>
									<ArrowBack />
								</IconButton>
							)}
						</div>

						{/* WEB TITLE - Center */}
						<div className='absolute left-1/2 transform -translate-x-1/2'>
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
						<div className='flex justify-end items-center gap-1 sm:gap-2 md:gap-3'>
							{/* USER INFORMATION */}
							<div className='hidden md:flex items-center gap-2'>
								{userProfile?.avatarUrl && (
									<img
										src={userProfile.avatarUrl}
										alt='Profile'
										className='w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-full border-2 border-purple-400'
									/>
								)}
								<span className='hidden lg:block text-xs xl:text-sm font-medium text-gray-700 truncate max-w-[100px] xl:max-w-[150px]'>
									{userProfile?.displayName}
								</span>
							</div>

							{/* LOGOUT BUTTON */}
							<Button
								onClick={handleLogout}
								size='sm'
								sx={{
									backgroundColor: "white",
									color: "#6366f1",
									border: "1px solid #e5e7eb",
									textTransform: "none",
									fontWeight: "bold",
									fontSize: {
										xs: "0.65rem",
										sm: "0.75rem",
										md: "0.8rem",
										lg: "0.875rem",
									},
									padding: {
										xs: "4px 8px",
										sm: "5px 10px",
										md: "6px 12px",
										lg: "8px 16px",
									},
									minWidth: "auto",
									"&:hover": {
										backgroundColor: "#f9fafb",
									},
								}}
							>
								Log Out
							</Button>
						</div>
					</div>
				</div>
			</nav>
		</>
	);
}

export default Navbar;
