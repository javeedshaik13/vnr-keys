import { Navigate, Route, Routes } from "react-router-dom";
import FloatingShape from "./components/ui/FloatingShape";
import SignUpPage from "./pages/auth/SignUpPage";
import LoginPage from "./pages/auth/LoginPage";
import EmailVerificationPage from "./pages/auth/EmailVerificationPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import LoadingSpinner from "./components/ui/LoadingSpinner";

// Dashboard Layout and Pages
import DashboardLayout from "./components/layout/DashboardLayout";
import HomePage from "./pages/dashboard/HomePage";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import OperatorDashboard from "./pages/dashboard/OperatorDashboard";
import ResponderDashboard from "./pages/dashboard/ResponderDashboard";
import ProfilePage from "./pages/dashboard/ProfilePage";
import ContactPage from "./pages/dashboard/ContactPage";
import AboutPage from "./pages/dashboard/AboutPage";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";
import RoleProtectedRoute from "./components/auth/RoleProtectedRoute";

// protect routes that require authentication
const ProtectedRoute = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

	if (!isAuthenticated) {
		return <Navigate to='/login' replace />;
	}

	if (!user?.isVerified) {
		return <Navigate to='/verify-email' replace />;
	}

	return children;
};

// redirect authenticated users to the appropriate dashboard
const RedirectAuthenticatedUser = ({ children }) => {
	const { isAuthenticated, user, getRoleBasedRoute } = useAuthStore();

	if (isAuthenticated && user?.isVerified) {
		const dashboardRoute = getRoleBasedRoute();
		return <Navigate to={dashboardRoute} replace />;
	}

	return children;
};

// Component to redirect to role-based dashboard
const RoleBasedRedirect = () => {
	const { getRoleBasedRoute } = useAuthStore();
	const dashboardRoute = getRoleBasedRoute();
	return <Navigate to={dashboardRoute} replace />;
};

function App() {
	const { isCheckingAuth, checkAuth } = useAuthStore();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	if (isCheckingAuth) return <LoadingSpinner />;

	return (
		<div
			className='min-h-screen bg-gradient-to-br
    from-gray-900 via-green-900 to-emerald-900 relative overflow-hidden'
		>
			<FloatingShape color='bg-green-500' size='w-64 h-64' top='-5%' left='10%' delay={0} />
			<FloatingShape color='bg-emerald-500' size='w-48 h-48' top='70%' left='80%' delay={5} />
			<FloatingShape color='bg-lime-500' size='w-32 h-32' top='40%' left='-10%' delay={2} />

			<Routes>
				{/* Role-based Dashboard Routes */}
				<Route
					path='/dashboard'
					element={
						<ProtectedRoute>
							<DashboardLayout />
						</ProtectedRoute>
					}
				>
					{/* Default dashboard - redirects to role-based dashboard */}
					<Route
						index
						element={<RoleBasedRedirect />}
					/>

					{/* Role-specific dashboard routes */}
					<Route
						path='admin'
						element={
							<RoleProtectedRoute allowedRoles={['admin']}>
								<AdminDashboard />
							</RoleProtectedRoute>
						}
					/>
					<Route
						path='operator'
						element={
							<RoleProtectedRoute allowedRoles={['admin', 'operator']}>
								<OperatorDashboard />
							</RoleProtectedRoute>
						}
					/>
					<Route
						path='responder'
						element={
							<RoleProtectedRoute allowedRoles={['admin', 'responder']}>
								<ResponderDashboard />
							</RoleProtectedRoute>
						}
					/>

					{/* Common dashboard routes accessible to all authenticated users */}
					<Route path='profile' element={<ProfilePage />} />
					<Route path='contact' element={<ContactPage />} />
					<Route path='about' element={<AboutPage />} />
				</Route>

				{/* Root route - redirect to role-based dashboard */}
				<Route
					path='/'
					element={
						<ProtectedRoute>
							<RoleBasedRedirect />
						</ProtectedRoute>
					}
				/>

				{/* Auth Routes */}
				<Route
					path='/signup'
					element={
						<RedirectAuthenticatedUser>
							<SignUpPage />
						</RedirectAuthenticatedUser>
					}
				/>
				<Route
					path='/login'
					element={
						<RedirectAuthenticatedUser>
							<LoginPage />
						</RedirectAuthenticatedUser>
					}
				/>
				<Route path='/verify-email' element={<EmailVerificationPage />} />
				<Route
					path='/forgot-password'
					element={
						<RedirectAuthenticatedUser>
							<ForgotPasswordPage />
						</RedirectAuthenticatedUser>
					}
				/>
				<Route
					path='/reset-password/:token'
					element={
						<RedirectAuthenticatedUser>
							<ResetPasswordPage />
						</RedirectAuthenticatedUser>
					}
				/>

				{/* catch all routes */}
				<Route path='*' element={<Navigate to='/dashboard' replace />} />
			</Routes>
			<Toaster />
		</div>
	);
}

export default App;
