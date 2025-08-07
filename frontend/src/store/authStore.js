import { create } from "zustand";
import axios from "axios";
import { handleError, handleSuccess, withErrorHandling } from "../utils/errorHandler.js";
import { validateEmail, validatePassword, validateName, validateVerificationCode } from "../utils/validation.js";

const API_URL = import.meta.env.VITE_API_URL
	? `${import.meta.env.VITE_API_URL}/auth`
	: import.meta.env.MODE === "development"
		? "http://localhost:5000/api/auth"
		: "/api/auth";

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.timeout = 10000; // 10 second timeout

// Request interceptor for logging (development only)
if (import.meta.env.DEV) {
	axios.interceptors.request.use((config) => {
		console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
		return config;
	});
}

// Response interceptor for error handling
axios.interceptors.response.use(
	(response) => response,
	(error) => {
		// Log error in development
		if (import.meta.env.DEV) {
			console.error('API Error:', error);
		}
		return Promise.reject(error);
	}
);

export const useAuthStore = create((set, get) => ({
	user: null,
	isAuthenticated: false,
	error: null,
	isLoading: false,
	isCheckingAuth: true,
	message: null,

	// Role-based routing helper
	getRoleBasedRoute: () => {
		const { user } = get();
		if (!user || !user.role) return '/dashboard';

		switch (user.role) {
			case 'admin':
				return '/dashboard/admin';
			case 'operator':
				return '/dashboard/operator';
			case 'responder':
				return '/dashboard/responder';
			default:
				return '/dashboard';
		}
	},

	// Check if user has required role
	hasRole: (requiredRole) => {
		const { user } = get();
		if (!user || !user.role) return false;

		// Admin has access to all roles
		if (user.role === 'admin') return true;

		// Check specific role
		return user.role === requiredRole;
	},

	// Check if user has any of the required roles
	hasAnyRole: (requiredRoles) => {
		const { user } = get();
		if (!user || !user.role) return false;

		// Admin has access to all roles
		if (user.role === 'admin') return true;

		// Check if user role is in required roles
		return requiredRoles.includes(user.role);
	},

	signup: async (email, password, name, role = 'operator') => {
		set({ isLoading: true, error: null });

		try {
			// Client-side validation
			const emailValidation = validateEmail(email);
			if (!emailValidation.isValid) {
				throw new Error(emailValidation.message);
			}

			const passwordValidation = validatePassword(password);
			if (!passwordValidation.isValid) {
				throw new Error(passwordValidation.message);
			}

			const nameValidation = validateName(name);
			if (!nameValidation.isValid) {
				throw new Error(nameValidation.message);
			}

			// Validate role
			const validRoles = ['admin', 'operator', 'responder'];
			if (!validRoles.includes(role)) {
				throw new Error('Invalid role selected');
			}

			const response = await axios.post(`${API_URL}/signup`, {
				email: email.trim().toLowerCase(),
				password,
				name: nameValidation.sanitizedValue,
				role
			});

			set({
				user: response.data.user,
				isAuthenticated: true,
				isLoading: false,
				error: null
			});

			handleSuccess(response.data.message || "Account created successfully!");
			return response.data;
		} catch (error) {
			const errorMessage = handleError(error);
			set({ error: errorMessage, isLoading: false });
			throw error;
		}
	},
	login: async (email, password) => {
		set({ isLoading: true, error: null });

		try {
			// Client-side validation
			const emailValidation = validateEmail(email);
			if (!emailValidation.isValid) {
				throw new Error(emailValidation.message);
			}

			if (!password) {
				throw new Error("Password is required");
			}

			const response = await axios.post(`${API_URL}/login`, {
				email: email.trim().toLowerCase(),
				password
			});

			set({
				isAuthenticated: true,
				user: response.data.user,
				error: null,
				isLoading: false,
			});

			handleSuccess(response.data.message || "Logged in successfully!");
			return response.data;
		} catch (error) {
			const errorMessage = handleError(error);
			set({ error: errorMessage, isLoading: false });
			throw error;
		}
	},

	logout: async () => {
		set({ isLoading: true, error: null });

		try {
			await axios.post(`${API_URL}/logout`);
			set({
				user: null,
				isAuthenticated: false,
				error: null,
				isLoading: false,
				message: null
			});
			handleSuccess("Logged out successfully!");
		} catch (error) {
			// Even if logout fails on server, clear local state
			set({
				user: null,
				isAuthenticated: false,
				error: null,
				isLoading: false,
				message: null
			});
			console.error("Logout error:", error);
			// Don't show error toast for logout failures
		}
	},
	verifyEmail: async (code) => {
		set({ isLoading: true, error: null });

		try {
			// Client-side validation
			const codeValidation = validateVerificationCode(code);
			if (!codeValidation.isValid) {
				throw new Error(codeValidation.message);
			}

			const response = await axios.post(`${API_URL}/verify-email`, {
				code: code.toString().trim()
			});

			set({
				user: response.data.user,
				isAuthenticated: true,
				isLoading: false,
				error: null
			});

			handleSuccess(response.data.message || "Email verified successfully!");
			return response.data;
		} catch (error) {
			const errorMessage = handleError(error);
			set({ error: errorMessage, isLoading: false });
			throw error;
		}
	},
	checkAuth: async () => {
		set({ isCheckingAuth: true, error: null });

		try {
			const response = await axios.get(`${API_URL}/check-auth`);
			set({
				user: response.data.user,
				isAuthenticated: true,
				isCheckingAuth: false,
				error: null
			});
		} catch (error) {
			// Don't show error toast for auth check failures
			set({
				user: null,
				isAuthenticated: false,
				isCheckingAuth: false,
				error: null
			});
		}
	},
	forgotPassword: async (email) => {
		set({ isLoading: true, error: null, message: null });

		try {
			// Client-side validation
			const emailValidation = validateEmail(email);
			if (!emailValidation.isValid) {
				throw new Error(emailValidation.message);
			}

			const response = await axios.post(`${API_URL}/forgot-password`, {
				email: email.trim().toLowerCase()
			});

			set({
				message: response.data.message,
				isLoading: false,
				error: null
			});

			handleSuccess(response.data.message || "Password reset link sent!");
			return response.data;
		} catch (error) {
			const errorMessage = handleError(error);
			set({ error: errorMessage, isLoading: false, message: null });
			throw error;
		}
	},
	resetPassword: async (token, password) => {
		set({ isLoading: true, error: null, message: null });

		try {
			// Client-side validation
			if (!token) {
				throw new Error("Reset token is required");
			}

			const passwordValidation = validatePassword(password);
			if (!passwordValidation.isValid) {
				throw new Error(passwordValidation.message);
			}

			const response = await axios.post(`${API_URL}/reset-password/${token}`, {
				password
			});

			set({
				message: response.data.message,
				isLoading: false,
				error: null
			});

			handleSuccess(response.data.message || "Password reset successful!");
			return response.data;
		} catch (error) {
			const errorMessage = handleError(error);
			set({ error: errorMessage, isLoading: false, message: null });
			throw error;
		}
	},

	updateProfile: async (profileData) => {
		set({ isLoading: true, error: null });

		try {
			// Client-side validation
			if (profileData.name) {
				const nameValidation = validateName(profileData.name);
				if (!nameValidation.isValid) {
					throw new Error(nameValidation.message);
				}
				profileData.name = nameValidation.sanitizedValue;
			}

			if (profileData.email) {
				const emailValidation = validateEmail(profileData.email);
				if (!emailValidation.isValid) {
					throw new Error(emailValidation.message);
				}
				profileData.email = profileData.email.trim().toLowerCase();
			}

			// For now, simulate the API call since we don't have a backend endpoint
			// In a real app, this would be:
			// const response = await axios.put(`${API_URL}/profile`, profileData);

			// Simulate API delay
			await new Promise(resolve => setTimeout(resolve, 1000));

			// Update the user in the store with the new profile data
			set((state) => ({
				user: { ...state.user, ...profileData },
				isLoading: false,
				error: null
			}));

			handleSuccess("Profile updated successfully!");
			return { user: profileData };
		} catch (error) {
			const errorMessage = handleError(error);
			set({ error: errorMessage, isLoading: false });
			throw error;
		}
	},

	// Fetch dashboard data based on user role
	fetchDashboardData: async () => {
		const { user } = get();
		if (!user || !user.role) {
			throw new Error("User not authenticated or role not found");
		}

		set({ isLoading: true, error: null });

		try {
			const dashboardAPI = import.meta.env.VITE_API_URL
				? `${import.meta.env.VITE_API_URL}/dashboard`
				: import.meta.env.MODE === "development"
					? "http://localhost:5000/api/dashboard"
					: "/api/dashboard";

			let endpoint;
			switch (user.role) {
				case 'admin':
					endpoint = `${dashboardAPI}/admin`;
					break;
				case 'operator':
					endpoint = `${dashboardAPI}/operator`;
					break;
				case 'responder':
					endpoint = `${dashboardAPI}/responder`;
					break;
				default:
					throw new Error("Invalid user role");
			}

			const response = await axios.get(endpoint);
			set({ isLoading: false, error: null });
			return response.data;
		} catch (error) {
			const errorMessage = handleError(error);
			set({ error: errorMessage, isLoading: false });
			throw error;
		}
	},
}));
