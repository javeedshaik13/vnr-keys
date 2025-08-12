import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import GoogleOAuthButton from "../../components/auth/GoogleOAuthButton";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const { login, isLoading, error, checkAuth, getRoleBasedRoute } = useAuthStore();

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
	}, [searchParams, navigate, checkAuth, getRoleBasedRoute]);

	const handleLogin = async (e) => {
		e.preventDefault();
		await login(email, password);
	};

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
					Welcome Back
				</h2>

				<form onSubmit={handleLogin}>
					<Input
						icon={Mail}
						type='email'
						placeholder='Email Address'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>

					<Input
						icon={Lock}
						type='password'
						placeholder='Password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>

					<div className='flex items-center mb-6'>
						<Link to='/forgot-password' className='text-sm text-green-400 hover:underline'>
							Forgot password?
						</Link>
					</div>
					{error && <p className='text-red-500 font-semibold mb-2'>{error}</p>}

					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						className='w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200'
						type='submit'
						disabled={isLoading}
					>
						{isLoading ? <Loader className='w-6 h-6 animate-spin  mx-auto' /> : "Login"}
					</motion.button>
				</form>

				{/* Divider */}
				<div className="flex items-center my-6">
					<div className="flex-1 border-t border-gray-600"></div>
					<span className="px-4 text-gray-400 text-sm">or</span>
					<div className="flex-1 border-t border-gray-600"></div>
				</div>

				{/* Google OAuth Button */}
				<GoogleOAuthButton isLoading={isLoading} />
			</div>
			<div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center'>
				<p className='text-sm text-gray-400'>
					Don't have an account?{" "}
					<Link to='/signup' className='text-green-400 hover:underline'>
						Sign up
					</Link>
				</p>
			</div>
		</motion.div>
	</div>
);
};
export default LoginPage;
