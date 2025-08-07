import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import { useSidebar } from "../../components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import { 
	AlertTriangle, 
	Clock, 
	CheckCircle, 
	MapPin, 
	Activity,
	Zap,
	Phone,
	Navigation
} from "lucide-react";

const ResponderDashboard = () => {
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
				console.error("Failed to load responder dashboard data:", error);
			} finally {
				setLoading(false);
			}
		};

		loadDashboardData();
	}, [fetchDashboardData]);

	const responderStats = dashboardData?.stats || {
		emergencyAlerts: 0,
		responseTime: "0 min",
		completedResponses: 0,
		activeIncidents: 0
	};

	const statsCards = [
		{ 
			icon: AlertTriangle, 
			label: "Emergency Alerts", 
			value: responderStats.emergencyAlerts, 
			color: "from-red-500 to-red-600",
			change: "2 new",
			urgent: true
		},
		{ 
			icon: Clock, 
			label: "Avg Response Time", 
			value: responderStats.responseTime, 
			color: "from-blue-500 to-blue-600",
			change: "-30s today"
		},
		{ 
			icon: CheckCircle, 
			label: "Completed Responses", 
			value: responderStats.completedResponses, 
			color: "from-green-500 to-green-600",
			change: "+5 today"
		},
		{ 
			icon: Zap, 
			label: "Active Incidents", 
			value: responderStats.activeIncidents, 
			color: "from-orange-500 to-orange-600",
			change: "1 critical"
		},
	];

	const recentIncidents = dashboardData?.recentIncidents || [];

	const getIncidentColor = (type) => {
		switch (type) {
			case 'Emergency': return 'text-red-400 bg-red-900/20 border-red-500/30';
			case 'Maintenance': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
			case 'Security': return 'text-purple-400 bg-purple-900/20 border-purple-500/30';
			default: return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
		}
	};

	const getStatusColor = (status) => {
		switch (status) {
			case 'Active': return 'text-red-400';
			case 'Resolved': return 'text-green-400';
			case 'In Progress': return 'text-yellow-400';
			default: return 'text-gray-400';
		}
	};

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
					Responder Dashboard
				</h1>
				<p className="text-gray-300">
					Welcome back, {user?.name}! Ready to respond to incidents.
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
						className={`bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-xl p-6 border border-gray-700 ${
							stat.urgent ? 'ring-2 ring-red-500/50 animate-pulse' : ''
						}`}
					>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-gray-400 text-sm font-medium">{stat.label}</p>
								<p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
								<p className={`text-sm mt-1 ${stat.urgent ? 'text-red-400' : 'text-green-400'}`}>
									{stat.change}
								</p>
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
				{/* Active Incidents */}
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5, delay: 0.4 }}
					className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-xl p-6 border border-gray-700"
				>
					<h3 className="text-xl font-semibold text-white mb-4 flex items-center">
						<AlertTriangle className="h-5 w-5 mr-2" />
						Active Incidents
					</h3>
					<div className="space-y-3">
						{recentIncidents.length > 0 ? recentIncidents.map((incident, index) => (
							<div key={incident.id} className={`p-4 rounded-lg border ${getIncidentColor(incident.type)}`}>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center space-x-2 mb-2">
											<span className={`px-2 py-1 rounded-full text-xs font-medium ${getIncidentColor(incident.type)}`}>
												{incident.type}
											</span>
											<span className={`text-sm font-medium ${getStatusColor(incident.status)}`}>
												{incident.status}
											</span>
										</div>
										<p className="text-white font-medium mb-1">Incident #{incident.id}</p>
										<p className="text-gray-300 text-sm flex items-center">
											<MapPin className="h-3 w-3 mr-1" />
											{incident.location}
										</p>
										<p className="text-gray-400 text-xs mt-1">
											{new Date(incident.timestamp).toLocaleString()}
										</p>
									</div>
									<div className="flex space-x-2">
										<button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
											<Navigation className="h-4 w-4 text-white" />
										</button>
										<button className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
											<Phone className="h-4 w-4 text-white" />
										</button>
									</div>
								</div>
							</div>
						)) : (
							<div className="text-center py-8">
								<CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
								<p className="text-gray-400">No active incidents</p>
								<p className="text-gray-500 text-sm">All clear!</p>
							</div>
						)}
					</div>
				</motion.div>

				{/* Response Status */}
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5, delay: 0.5 }}
					className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-xl p-6 border border-gray-700"
				>
					<h3 className="text-xl font-semibold text-white mb-4 flex items-center">
						<Activity className="h-5 w-5 mr-2" />
						Response Status
					</h3>
					<div className="space-y-4">
						<div className="flex items-center justify-between p-3 bg-green-900/20 rounded-lg border border-green-500/30">
							<div className="flex items-center">
								<div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
								<span className="text-green-400 font-medium">Available</span>
							</div>
							<span className="text-white text-sm">Ready for dispatch</span>
						</div>
						
						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-gray-300">Current Location</span>
								<span className="text-white">Station Alpha</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-gray-300">Last Response</span>
								<span className="text-white">2 hours ago</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-gray-300">Equipment Status</span>
								<span className="text-green-400">All Ready</span>
							</div>
						</div>

						<div className="pt-4 border-t border-gray-700">
							<h4 className="text-white font-medium mb-2">Quick Response</h4>
							<div className="grid grid-cols-2 gap-2">
								<button className="p-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm font-medium transition-colors">
									Emergency
								</button>
								<button className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded text-white text-sm font-medium transition-colors">
									Non-Emergency
								</button>
							</div>
						</div>
					</div>
				</motion.div>
			</div>

			{/* Emergency Actions */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.6 }}
				className="mt-8 bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-xl p-6 border border-gray-700"
			>
				<h3 className="text-xl font-semibold text-white mb-4 flex items-center">
					<Zap className="h-5 w-5 mr-2" />
					Emergency Actions
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<button className="flex items-center justify-center p-4 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
						<AlertTriangle className="h-5 w-5 mr-2" />
						<span className="text-white font-medium">Report Emergency</span>
					</button>
					<button className="flex items-center justify-center p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
						<Navigation className="h-5 w-5 mr-2" />
						<span className="text-white font-medium">Navigate</span>
					</button>
					<button className="flex items-center justify-center p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
						<Phone className="h-5 w-5 mr-2" />
						<span className="text-white font-medium">Contact Dispatch</span>
					</button>
					<button className="flex items-center justify-center p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
						<CheckCircle className="h-5 w-5 mr-2" />
						<span className="text-white font-medium">Mark Resolved</span>
					</button>
				</div>
			</motion.div>
		</div>
	);
};

export default ResponderDashboard;
