import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import { useSidebar } from "../../components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import { 
	Users, 
	Shield, 
	Activity, 
	TrendingUp, 
	UserCheck, 
	UserX,
	Settings,
	BarChart3,
	AlertTriangle
} from "lucide-react";

const AdminDashboard = () => {
	const { user, fetchDashboardData } = useAuthStore();
	const { sidebarOpen } = useSidebar();
	const [dashboardData, setDashboardData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadDashboardData = async () => {
			try {
				const data = await fetchDashboardData();
				setDashboardData(data.data);
			} catch (error) {
				console.error("Failed to load admin dashboard data:", error);
			} finally {
				setLoading(false);
			}
		};

		loadDashboardData();
	}, [fetchDashboardData]);

	const adminStats = dashboardData?.stats || {
		totalUsers: 0,
		verifiedUsers: 0,
		unverifiedUsers: 0,
		usersByRole: { admin: 0, operator: 0, responder: 0 }
	};

	const statsCards = [
		{ 
			icon: Users, 
			label: "Total Users", 
			value: adminStats.totalUsers, 
			color: "from-blue-500 to-blue-600",
			change: "+12%"
		},
		{ 
			icon: UserCheck, 
			label: "Verified Users", 
			value: adminStats.verifiedUsers, 
			color: "from-green-500 to-green-600",
			change: "+8%"
		},
		{ 
			icon: UserX, 
			label: "Unverified Users", 
			value: adminStats.unverifiedUsers, 
			color: "from-orange-500 to-orange-600",
			change: "-3%"
		},
		{ 
			icon: Shield, 
			label: "Admin Users", 
			value: adminStats.usersByRole.admin || 0, 
			color: "from-purple-500 to-purple-600",
			change: "+1"
		},
	];

	const roleDistribution = [
		{ role: "Operators", count: adminStats.usersByRole.operator || 0, color: "bg-blue-500" },
		{ role: "Responders", count: adminStats.usersByRole.responder || 0, color: "bg-green-500" },
		{ role: "Admins", count: adminStats.usersByRole.admin || 0, color: "bg-purple-500" },
	];

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
			</div>
		);
	}

	return (
		<div className={`p-6 transition-all duration-300 ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="mb-8"
			>
				<h1 className="text-3xl font-bold text-white mb-2">
					Admin Dashboard
				</h1>
				<p className="text-gray-300">
					Welcome back, {user?.name}! Here's your system overview.
				</p>
			</motion.div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				{statsCards.map((stat, index) => (
					<motion.div
						key={stat.label}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: index * 0.1 }}
						className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-xl p-6 border border-gray-700"
					>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-gray-400 text-sm font-medium">{stat.label}</p>
								<p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
								<p className="text-green-400 text-sm mt-1">{stat.change}</p>
							</div>
							<div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
								<stat.icon className="h-6 w-6 text-white" />
							</div>
						</div>
					</motion.div>
				))}
			</div>

			{/* Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Role Distribution */}
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5, delay: 0.4 }}
					className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-xl p-6 border border-gray-700"
				>
					<h3 className="text-xl font-semibold text-white mb-4 flex items-center">
						<BarChart3 className="h-5 w-5 mr-2" />
						User Role Distribution
					</h3>
					<div className="space-y-4">
						{roleDistribution.map((item, index) => (
							<div key={item.role} className="flex items-center justify-between">
								<div className="flex items-center">
									<div className={`w-3 h-3 rounded-full ${item.color} mr-3`}></div>
									<span className="text-gray-300">{item.role}</span>
								</div>
								<span className="text-white font-semibold">{item.count}</span>
							</div>
						))}
					</div>
				</motion.div>

				{/* Recent Users */}
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5, delay: 0.5 }}
					className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-xl p-6 border border-gray-700"
				>
					<h3 className="text-xl font-semibold text-white mb-4 flex items-center">
						<Activity className="h-5 w-5 mr-2" />
						Recent Users
					</h3>
					<div className="space-y-3">
						{dashboardData?.recentUsers?.slice(0, 5).map((recentUser, index) => (
							<div key={recentUser.id} className="flex items-center justify-between py-2">
								<div className="flex items-center">
									<div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-3">
										<span className="text-white text-sm font-semibold">
											{recentUser.name.charAt(0).toUpperCase()}
										</span>
									</div>
									<div>
										<p className="text-white text-sm font-medium">{recentUser.name}</p>
										<p className="text-gray-400 text-xs">{recentUser.role}</p>
									</div>
								</div>
								<div className="flex items-center">
									{recentUser.isVerified ? (
										<UserCheck className="h-4 w-4 text-green-500" />
									) : (
										<UserX className="h-4 w-4 text-orange-500" />
									)}
								</div>
							</div>
						)) || (
							<p className="text-gray-400 text-center py-4">No recent users</p>
						)}
					</div>
				</motion.div>
			</div>

			{/* Admin Actions */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.6 }}
				className="mt-8 bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-xl p-6 border border-gray-700"
			>
				<h3 className="text-xl font-semibold text-white mb-4 flex items-center">
					<Settings className="h-5 w-5 mr-2" />
					Admin Actions
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<button className="flex items-center justify-center p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
						<Users className="h-5 w-5 mr-2" />
						<span className="text-white font-medium">Manage Users</span>
					</button>
					<button className="flex items-center justify-center p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
						<Shield className="h-5 w-5 mr-2" />
						<span className="text-white font-medium">Security Settings</span>
					</button>
					<button className="flex items-center justify-center p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
						<BarChart3 className="h-5 w-5 mr-2" />
						<span className="text-white font-medium">View Reports</span>
					</button>
				</div>
			</motion.div>
		</div>
	);
};

export default AdminDashboard;
