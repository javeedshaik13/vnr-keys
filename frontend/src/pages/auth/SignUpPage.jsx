import { motion } from "framer-motion";
import Input from "../../components/ui/Input";
import { Loader, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthMeter from "../../components/forms/PasswordStrengthMeter";
import { useAuthStore } from "../../store/authStore";
import { validateEmail, validatePassword, validateName } from "../../utils/validation";

const SignUpPage = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState("operator");
	const [fieldErrors, setFieldErrors] = useState({});
	const navigate = useNavigate();

	const { signup, error, isLoading } = useAuthStore();

	// Real-time validation
	const validateField = (fieldName, value) => {
		let validation;
		switch (fieldName) {
			case 'email':
				validation = validateEmail(value);
				break;
			case 'password':
				validation = validatePassword(value);
				break;
			case 'name':
				validation = validateName(value);
				break;
			default:
				return;
		}

		setFieldErrors(prev => ({
			...prev,
			[fieldName]: validation.isValid ? null : validation.message
		}));
	};

	const handleSignUp = async (e) => {
		e.preventDefault();

		// Clear previous errors
		setFieldErrors({});

		// Validate all fields
		const emailValidation = validateEmail(email);
		const passwordValidation = validatePassword(password);
		const nameValidation = validateName(name);

		const errors = {};
		if (!emailValidation.isValid) errors.email = emailValidation.message;
		if (!passwordValidation.isValid) errors.password = passwordValidation.message;
		if (!nameValidation.isValid) errors.name = nameValidation.message;

		if (Object.keys(errors).length > 0) {
			setFieldErrors(errors);
			return;
		}

		try {
			await signup(email, password, name, role);
			navigate("/verify-email");
		} catch (error) {
			// Error is already handled in the store
			console.error("Signup failed:", error);
		}
	};
	return (
		<div className='min-h-screen flex items-center justify-center relative z-50 px-4'>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl
				overflow-hidden'
			>
			<div className='p-8'>
				<h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>
					Create Account
				</h2>

				<form onSubmit={handleSignUp}>
					<Input
						icon={User}
						type='text'
						placeholder='Full Name'
						value={name}
						onChange={(e) => {
							setName(e.target.value);
							validateField('name', e.target.value);
						}}
						error={fieldErrors.name}
					/>
					<Input
						icon={Mail}
						type='email'
						placeholder='Email Address'
						value={email}
						onChange={(e) => {
							setEmail(e.target.value);
							validateField('email', e.target.value);
						}}
						error={fieldErrors.email}
					/>
					<Input
						icon={Lock}
						type='password'
						placeholder='Password'
						value={password}
						onChange={(e) => {
							setPassword(e.target.value);
							validateField('password', e.target.value);
						}}
						error={fieldErrors.password}
					/>
					<PasswordStrengthMeter password={password} />

					{/* Role Selection */}
					<div className='mb-6'>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							Select Role
						</label>
						<select
							value={role}
							onChange={(e) => setRole(e.target.value)}
							className='w-full px-3 py-2 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400 transition duration-200'
						>
							<option value="operator">Operator</option>
							<option value="responder">Responder</option>
							<option value="admin">Admin</option>
						</select>
					</div>

					<motion.button
						className='mt-5 w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
						font-bold rounded-lg shadow-lg hover:from-green-600
						hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
						 focus:ring-offset-gray-900 transition duration-200'
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						type='submit'
						disabled={isLoading}
					>
						{isLoading ? <Loader className=' animate-spin mx-auto' size={24} /> : "Sign Up"}
					</motion.button>
				</form>
			</div>
			<div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center'>
				<p className='text-sm text-gray-400'>
					Already have an account?{" "}
					<Link to={"/login"} className='text-green-400 hover:underline'>
						Login
					</Link>
				</p>
			</div>
		</motion.div>
	</div>
);
};
export default SignUpPage;
