import { useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import GoogleOAuthButton from "../../components/auth/GoogleOAuthButton";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

const LoginPage = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const { isLoading, error, checkAuth, getRoleBasedRoute } = useAuthStore();

	// Handle OAuth callback
	useEffect(() => {
		const authStatus = searchParams.get('auth');
		const errorParam = searchParams.get('error');

		if (authStatus === 'success') {
			toast.success('Successfully logged in with Google!');
			// Check auth and redirect to appropriate dashboard
			checkAuth().then(() => {
				const route = getRoleBasedRoute();
				navigate(route, { replace: true });
			});
		} else if (errorParam === 'oauth_failed') {
			toast.error('Google authentication failed. Please try again.');
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams.get('auth')]); // Only depend on searchParams, not functions

	return (
		<div className='min-h-screen flex items-center justify-center relative z-50 px-4'>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden'
			>
			<div className='p-8'>
				<h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>
					Welcome to VNR Keys
				</h2>

				<p className='text-gray-300 text-center mb-8'>
					Sign in with your Google account to continue
				</p>

				{error && <p className='text-red-500 font-semibold mb-4 text-center'>{error}</p>}

				{/* Google OAuth Button */}
				<GoogleOAuthButton isLoading={isLoading} />
			</div>
			<div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center'>
				<p className='text-sm text-gray-400 text-center'>
					Secure access with Google authentication
				</p>
			</div>
		</motion.div>
	</div>
);
};
export default LoginPage;
