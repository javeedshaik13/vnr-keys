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
import ManageKeysPage from "./pages/admin/ManageKeysPage";
import SecuritySettingsPage from "./pages/admin/SecuritySettingsPage";
import ViewReportsPage from "./pages/admin/ViewReportsPage";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { useKeyStore } from "./store/keyStore";
import { useEffect } from "react";

function App() {
  const { isCheckingAuth, checkAuth } = useAuthStore();
  const { initializeSocket, disconnectSocket } = useKeyStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    initializeSocket();
    return () => disconnectSocket();
  }, [initializeSocket, disconnectSocket]);

  if (isCheckingAuth) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      <Routes>
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard/admin" replace />} />

          {/* Role Dashboards (now open) */}
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="operator" element={<OperatorDashboard />} />
          <Route path="responder" element={<ResponderDashboard />} />
          <Route path="security" element={<SecurityDashboard />} />
          <Route path="faculty" element={<FacultyDashboard />} />

          {/* Admin Feature Pages */}
          <Route path="admin/users" element={<ManageUsersPage />} />
          <Route path="admin/keys" element={<ManageKeysPage />} />
          <Route path="admin/security" element={<SecuritySettingsPage />} />
          <Route path="admin/reports" element={<ViewReportsPage />} />

          {/* Common Pages */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>

        {/* Root route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/complete-registration" element={<CompleteRegistrationPage />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;