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

		</div>
	);
};

export default ResponderDashboard;
