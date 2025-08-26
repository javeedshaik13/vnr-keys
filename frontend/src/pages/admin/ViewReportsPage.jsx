import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  Activity,
  Download,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { handleError, handleSuccess } from '../../utils/errorHandler';
import jsPDF from 'jspdf';

const ViewReportsPage = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  const API_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/dashboard`
    : import.meta.env.MODE === "development"
      ? "http://localhost:6203/api/dashboard"
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

  const handleExportReport = async () => {
    if (!reports) return;

    try {
      // Create a new jsPDF instance
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Add header
      pdf.setFontSize(20);
      pdf.setTextColor(139, 69, 19); // Purple color
      pdf.text('VNR Keys - System Report', pageWidth / 2, 20, { align: 'center' });

      // Add a line under the header
      pdf.setDrawColor(139, 69, 19);
      pdf.line(20, 25, pageWidth - 20, 25);

      // Add date and time range
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const currentTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      pdf.text(`Generated on: ${currentDate} at ${currentTime}`, 20, 35);
      pdf.text(`Time Range: ${timeRange === '7d' ? 'Last 7 days' : timeRange === '30d' ? 'Last 30 days' : 'Last 90 days'}`, 20, 45);
      pdf.text('VNRVJIET Key Management System', 20, 55);

      // Add overview statistics
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('System Overview', 20, 75);

      // Stats section
      pdf.setFontSize(12);
      const stats = [
        { label: 'Total Users', value: reports?.userAnalytics?.totalUsers || 0, change: `+${reports?.userAnalytics?.newUsers || 0} new this period` },
        { label: 'Active Users', value: reports?.userAnalytics?.activeUsers || 0, change: '100% of total' },
        { label: 'API Keys', value: 0, change: '0 active' },
        { label: 'Peak Usage', value: 0, change: '' }
      ];

      let yPosition = 90;
      stats.forEach((stat) => {
        pdf.setTextColor(0, 0, 0);
        pdf.text(`${stat.label}:`, 20, yPosition);
        pdf.setTextColor(139, 69, 19);
        pdf.text(`${stat.value}`, 80, yPosition);
        if (stat.change) {
          pdf.setTextColor(100, 100, 100);
          pdf.text(`(${stat.change})`, 100, yPosition);
        }
        yPosition += 15;
      });

      // Add registration trend section
      yPosition += 10;
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('User Registration Trend', 20, yPosition);

      // Add trend data if available
      if (reports?.userAnalytics?.registrationTrend) {
        yPosition += 20;
        pdf.setFontSize(10);
        pdf.text('Date', 20, yPosition);
        pdf.text('Registrations', 80, yPosition);
        yPosition += 10;

        reports.userAnalytics.registrationTrend.forEach((day) => {
          const date = new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          pdf.text(date, 20, yPosition);
          pdf.text(day.count.toString(), 80, yPosition);
          yPosition += 8;

          // Check if we need a new page
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }
        });
      }

      // Add footer
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('VNR Keys Management System - Confidential Report', pageWidth / 2, pageHeight - 10, { align: 'center' });

      // Save the PDF
      const fileName = `vnr-keys-report-${timeRange}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      handleSuccess('PDF report exported successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      handleError(error, 'Failed to export PDF report');
    }
  };



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
              Export PDF
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-800 rounded-xl p-6">
          <OverviewReport reports={reports} />
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
        change={null}
        changeLabel="100% of total"
        icon={Activity}
        color="green"
      />
      <StatCard
        title="API Keys"
        value={0}
        change={null}
        changeLabel="0 active"
        icon={Activity}
        color="purple"
      />
      <StatCard
        title="Peak Usage"
        value={0}
        change={null}
        changeLabel=""
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
