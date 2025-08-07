import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import { Calendar, Clock, Activity, TrendingUp, Users } from "lucide-react";
import { useSidebar } from "../../components/layout/DashboardLayout";

const HomePage = () => {
  const { user } = useAuthStore();
  const { sidebarOpen } = useSidebar();

  const stats = [
    { icon: Users, label: "Team Members", value: "12", color: "from-blue-500 to-blue-600" },
    { icon: Activity, label: "Active Projects", value: "8", color: "from-green-500 to-green-600" },
    { icon: TrendingUp, label: "Completed Tasks", value: "24", color: "from-purple-500 to-purple-600" },
    { icon: Clock, label: "Hours Logged", value: "156", color: "from-orange-500 to-orange-600" },
  ];

  const recentActivities = [
    { action: "Project Alpha updated", time: "2 hours ago", type: "update" },
    { action: "New team member joined", time: "4 hours ago", type: "user" },
    { action: "Task completed: UI Design", time: "6 hours ago", type: "task" },
    { action: "Meeting scheduled for tomorrow", time: "1 day ago", type: "meeting" },
  ];

  return (
    <div className={`space-y-6 ${sidebarOpen ? 'p-4 lg:p-6' : 'p-4 lg:p-8 xl:px-12'}`}>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-gray-300">
              Here's what's going on in your projects.
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4 text-gray-400">
            <div className="flex items-center space-x-2">
              <Calendar size={16} />
              <span className="text-sm">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </motion.div>


    </div>
  );
};

export default HomePage;
