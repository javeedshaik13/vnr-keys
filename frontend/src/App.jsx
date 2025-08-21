import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import CompleteRegistrationPage from "./pages/auth/CompleteRegistrationPage";
import LoadingSpinner from "./components/ui/LoadingSpinner";

// Dashboard Layout and Pages
import DashboardLayout from "./components/layout/DashboardLayout";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import OperatorDashboard from "./pages/dashboard/OperatorDashboard";
import ResponderDashboard from "./pages/dashboard/ResponderDashboard";
import SecurityDashboard from "./pages/dashboard/SecurityDashboard";
import FacultyDashboard from "./pages/dashboard/FacultyDashboard";
import ProfilePage from "./pages/dashboard/ProfilePage";
import AboutPage from "./pages/dashboard/AboutPage";
import ManageUsersPage from "./pages/admin/ManageUsersPage";
import SecuritySettingsPage from "./pages/admin/SecuritySettingsPage";
import ViewReportsPage from "./pages/admin/ViewReportsPage";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { useKeyStore } from "./store/keyStore";
import { useEffect } from "react";
import RoleProtectedRoute from "./components/auth/RoleProtectedRoute";

// protect routes that require authentication
const ProtectedRoute = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

	if (!isAuthenticated) {
		return <Navigate to='/login' replace />;
	}

	// Check if user needs to complete registration
	if (user && (user.role === 'pending' || (user.role === 'faculty' && (!user.department || !user.facultyId)))) {
		return <Navigate to='/complete-registration' replace />;
	}

	return children;
};

// redirect authenticated users to the appropriate dashboard
const RedirectAuthenticatedUser = ({ children }) => {
	const { isAuthenticated, user, getRoleBasedRoute } = useAuthStore();

	if (isAuthenticated && user) {
		// Check if user needs to complete registration
		if (user.role === 'pending' || (user.role === 'faculty' && (!user.department || !user.facultyId))) {
			return <Navigate to='/complete-registration' replace />;
		}

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
	const { isCheckingAuth, checkAuth, isAuthenticated } = useAuthStore();
	const { initializeSocket, disconnectSocket } = useKeyStore();

	useEffect(() => {
		checkAuth();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Only run once on mount

	// Initialize socket connection when user is authenticated
	useEffect(() => {
		if (isAuthenticated) {
			initializeSocket();
		} else {
			disconnectSocket();
		}

		// Cleanup on unmount
		return () => {
			disconnectSocket();
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAuthenticated]); // Only depend on isAuthenticated

	if (isCheckingAuth) return <LoadingSpinner />;

	return (
		<div className='min-h-screen bg-gray-900 relative overflow-hidden'>
			{/* Removed FloatingShape and green gradient background */}
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

					{/* Admin-only feature pages */}
					<Route
						path='admin/users'
						element={
							<RoleProtectedRoute allowedRoles={['admin']}>
								<ManageUsersPage />
							</RoleProtectedRoute>
						}
					/>
					<Route
						path='admin/security'
						element={
							<RoleProtectedRoute allowedRoles={['admin']}>
								<SecuritySettingsPage />
							</RoleProtectedRoute>
						}
					/>
					<Route
						path='admin/reports'
						element={
							<RoleProtectedRoute allowedRoles={['admin']}>
								<ViewReportsPage />
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
					<Route
						path='security'
						element={
							<RoleProtectedRoute allowedRoles={['admin', 'security']}>
								<SecurityDashboard />
							</RoleProtectedRoute>
						}
					/>
					<Route
						path='faculty'
						element={
							<RoleProtectedRoute allowedRoles={['admin', 'faculty']}>
								<FacultyDashboard />
							</RoleProtectedRoute>
						}
					/>

					{/* Common dashboard routes accessible to all authenticated users */}
					<Route path='profile' element={<ProfilePage />} />
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
					path='/login'
					element={
						<RedirectAuthenticatedUser>
							<LoginPage />
						</RedirectAuthenticatedUser>
					}
				/>
				<Route
					path='/complete-registration'
					element={<CompleteRegistrationPage />}
				/>

				{/* catch all routes */}
				<Route path='*' element={<Navigate to='/dashboard' replace />} />
			</Routes>
			<Toaster />
		</div>
	);
}

export default App;
