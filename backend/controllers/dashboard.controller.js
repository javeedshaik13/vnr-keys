import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/errorHandler.js";

/**
 * Admin Dashboard - Accessible only to admin users
 */
export const getAdminDashboard = asyncHandler(async (req, res) => {
	// Get admin-specific data
	const totalUsers = await User.countDocuments();
	const usersByRole = await User.aggregate([
		{
			$group: {
				_id: "$role",
				count: { $sum: 1 }
			}
		}
	]);

	const recentUsers = await User.find()
		.select('-password -resetPasswordToken -verificationToken')
		.sort({ createdAt: -1 })
		.limit(10);

	const verifiedUsers = await User.countDocuments({ isVerified: true });
	const unverifiedUsers = await User.countDocuments({ isVerified: false });

	res.status(200).json({
		success: true,
		message: "Admin dashboard data retrieved successfully",
		data: {
			stats: {
				totalUsers,
				verifiedUsers,
				unverifiedUsers,
				usersByRole: usersByRole.reduce((acc, item) => {
					acc[item._id] = item.count;
					return acc;
				}, {})
			},
			recentUsers,
			userRole: req.userRole
		}
	});
});

/**
 * Operator Dashboard - Accessible to operator and admin users
 */
export const getOperatorDashboard = asyncHandler(async (req, res) => {
	// Get operator-specific data
	const currentUser = await User.findById(req.userId).select('-password');
	
	// Mock operator-specific metrics (replace with actual business logic)
	const operatorStats = {
		activeTickets: 15,
		resolvedTickets: 42,
		pendingTasks: 8,
		completedTasks: 23
	};

	// Recent activity (mock data - replace with actual activity tracking)
	const recentActivity = [
		{ id: 1, action: "Resolved ticket #1234", timestamp: new Date(Date.now() - 1000 * 60 * 30) },
		{ id: 2, action: "Updated task status", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
		{ id: 3, action: "Created new report", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) }
	];

	res.status(200).json({
		success: true,
		message: "Operator dashboard data retrieved successfully",
		data: {
			user: currentUser,
			stats: operatorStats,
			recentActivity,
			userRole: req.userRole
		}
	});
});

/**
 * Responder Dashboard - Accessible to responder and admin users
 */
export const getResponderDashboard = asyncHandler(async (req, res) => {
	// Get responder-specific data
	const currentUser = await User.findById(req.userId).select('-password');
	
	// Mock responder-specific metrics (replace with actual business logic)
	const responderStats = {
		emergencyAlerts: 3,
		responseTime: "4.2 min",
		completedResponses: 18,
		activeIncidents: 2
	};

	// Recent incidents (mock data - replace with actual incident tracking)
	const recentIncidents = [
		{ 
			id: 1, 
			type: "Emergency", 
			location: "Building A - Floor 3", 
			status: "Active",
			timestamp: new Date(Date.now() - 1000 * 60 * 15)
		},
		{ 
			id: 2, 
			type: "Maintenance", 
			location: "Building B - Parking", 
			status: "Resolved",
			timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1)
		}
	];

	res.status(200).json({
		success: true,
		message: "Responder dashboard data retrieved successfully",
		data: {
			user: currentUser,
			stats: responderStats,
			recentIncidents,
			userRole: req.userRole
		}
	});
});

/**
 * Get current user profile with role information
 */
export const getUserProfile = asyncHandler(async (req, res) => {
	const user = await User.findById(req.userId).select('-password -resetPasswordToken -verificationToken');
	
	if (!user) {
		return res.status(404).json({
			success: false,
			message: "User not found"
		});
	}

	res.status(200).json({
		success: true,
		message: "User profile retrieved successfully",
		data: {
			user,
			userRole: req.userRole
		}
	});
});
