import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Key, 
  Activity, 
  Download, 
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { handleError, handleSuccess } from '../../utils/errorHandler';

const ViewReportsPage = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  const API_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/dashboard`
    : import.meta.env.MODE === "development"
      ? "http://localhost:8000/api/dashboard"
      : "/api/dashboard";

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/reports`, {
        params: { timeRange }
      });
      setReports(response.data.data);
    } catch (error) {
      handleError(error, 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    if (!reports) return;
    
    const reportData = {
      generatedAt: reports.generatedAt,
      timeRange: reports.timeRange,
      ...reports
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `system-report-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    handleSuccess('Report exported successfully');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Analytics', icon: Users },
    { id: 'keys', label: 'API Keys', icon: Key },
    { id: 'system', label: 'System Health', icon: Activity }
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-white mt-4">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-purple-400 mr-4" />
            <h1 className="text-3xl font-bold text-white">System Reports</h1>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button
              onClick={fetchReports}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RefreshCw className="h-5 w-5 text-gray-300" />
            </button>
            <button
              onClick={handleExportReport}
              className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Download className="h-5 w-5 mr-2" />
              Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-xl p-6">
              {activeTab === 'overview' && (
                <OverviewReport reports={reports} />
              )}
              {activeTab === 'users' && (
                <UserAnalyticsReport reports={reports?.userAnalytics} />
              )}
              {activeTab === 'keys' && (
                <ApiKeyReport reports={reports?.apiKeyAnalytics} />
              )}
              {activeTab === 'system' && (
                <SystemHealthReport reports={reports?.systemHealth} />
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Overview Report Component
const OverviewReport = ({ reports }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-white">System Overview</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Users"
        value={reports?.userAnalytics?.totalUsers || 0}
        change={reports?.userAnalytics?.newUsers || 0}
        changeLabel="new this period"
        icon={Users}
        color="blue"
      />
      <StatCard
        title="Active Users"
        value={reports?.userAnalytics?.activeUsers || 0}
        change={((reports?.userAnalytics?.activeUsers / reports?.userAnalytics?.totalUsers) * 100).toFixed(1)}
        changeLabel="% of total"
        icon={Activity}
        color="green"
      />
      <StatCard
        title="API Keys"
        value={reports?.apiKeyAnalytics?.totalApiKeys || 0}
        change={reports?.apiKeyAnalytics?.activeApiKeys || 0}
        changeLabel="active"
        icon={Key}
        color="purple"
      />
      <StatCard
        title="Total Usage"
        value={reports?.apiKeyAnalytics?.totalUsage || 0}
        change={null}
        changeLabel="requests"
        icon={BarChart3}
        color="orange"
      />
    </div>

    {/* Registration Trend Chart */}
    <div className="bg-gray-700 rounded-lg p-6">
      <h4 className="text-lg font-semibold text-white mb-4">User Registration Trend</h4>
      <div className="h-64 flex items-end justify-between space-x-2">
        {reports?.userAnalytics?.registrationTrend?.map((day, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className="bg-blue-500 rounded-t w-full transition-all duration-300 hover:bg-blue-400"
              style={{
                height: `${Math.max((day.count / Math.max(...reports.userAnalytics.registrationTrend.map(d => d.count))) * 200, 4)}px`
              }}
            ></div>
            <span className="text-xs text-gray-400 mt-2 transform rotate-45">
              {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// User Analytics Report Component
const UserAnalyticsReport = ({ userAnalytics }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-white">User Analytics</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">User Status</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-300">Verified Users</span>
            <span className="text-green-400">{userAnalytics?.verifiedUsers || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Unverified Users</span>
            <span className="text-red-400">{(userAnalytics?.totalUsers - userAnalytics?.verifiedUsers) || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Active Users</span>
            <span className="text-blue-400">{userAnalytics?.activeUsers || 0}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Role Distribution</h4>
        <div className="space-y-3">
          {Object.entries(userAnalytics?.roleDistribution || {}).map(([role, count]) => (
            <div key={role} className="flex justify-between">
              <span className="text-gray-300 capitalize">{role}</span>
              <span className="text-white">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Growth Metrics</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-300">New Users</span>
            <span className="text-green-400">+{userAnalytics?.newUsers || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Growth Rate</span>
            <span className="text-blue-400">
              {userAnalytics?.totalUsers > 0 
                ? ((userAnalytics?.newUsers / userAnalytics?.totalUsers) * 100).toFixed(1)
                : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// API Key Report Component
const ApiKeyReport = ({ apiKeyAnalytics }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-white">API Key Analytics</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Keys"
        value={apiKeyAnalytics?.totalApiKeys || 0}
        icon={Key}
        color="purple"
      />
      <StatCard
        title="Active Keys"
        value={apiKeyAnalytics?.activeApiKeys || 0}
        icon={Activity}
        color="green"
      />
      <StatCard
        title="Inactive Keys"
        value={apiKeyAnalytics?.inactiveApiKeys || 0}
        icon={Key}
        color="red"
      />
      <StatCard
        title="Total Usage"
        value={apiKeyAnalytics?.totalUsage || 0}
        icon={BarChart3}
        color="blue"
      />
    </div>
  </div>
);

// System Health Report Component
const SystemHealthReport = ({ systemHealth }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-white">System Health</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Performance Metrics</h4>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-300">CPU Usage</span>
              <span className="text-white">{systemHealth?.cpuUsage?.toFixed(1) || 0}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${systemHealth?.cpuUsage || 0}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-300">Disk Usage</span>
              <span className="text-white">{systemHealth?.diskUsage?.toFixed(1) || 0}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${systemHealth?.diskUsage || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">System Info</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-300">Uptime</span>
            <span className="text-white">{Math.floor((systemHealth?.uptime || 0) / 3600)}h</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Memory Usage</span>
            <span className="text-white">
              {((systemHealth?.memoryUsage?.used || 0) / 1024 / 1024).toFixed(0)}MB
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Response Time</span>
            <span className="text-white">{systemHealth?.responseTime?.toFixed(0) || 0}ms</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Reusable Stat Card Component
const StatCard = ({ title, value, change, changeLabel, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-500/10',
    green: 'text-green-400 bg-green-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    orange: 'text-orange-400 bg-orange-500/10',
    red: 'text-red-400 bg-red-500/10'
  };

  return (
    <div className="bg-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
          {change !== null && (
            <p className="text-sm text-gray-400">
              {change} {changeLabel}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default ViewReportsPage;
