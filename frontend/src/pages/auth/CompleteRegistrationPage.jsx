import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { GraduationCap, Shield, User, Building, IdCard, CheckCircle } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import FloatingShape from "../../components/ui/FloatingShape";

const CompleteRegistrationPage = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [forceShowForm, setForceShowForm] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, checkAuth, getRoleBasedRoute, isCheckingAuth, forceResetAuthState } = useAuthStore();

  useEffect(() => {
    const authStatus = searchParams.get('auth');
    if (authStatus === 'success') {
      toast.success('Successfully authenticated with Google!');
    }
  }, [searchParams]);

  // Auth is handled by App.jsx, but let's ensure it's called
  useEffect(() => {
    console.log('🔍 CompleteRegistrationPage - Auth state:', { user: !!user, isCheckingAuth });

    if (!user && !isCheckingAuth) {
      console.log('🔄 Manually triggering auth check from CompleteRegistrationPage');
      checkAuth();
    }

    // Force reset if stuck in checking state for too long
    const resetTimeout = setTimeout(() => {
      if (isCheckingAuth && !user) {
        console.log('⚠️ Auth check stuck, forcing reset...');
        forceResetAuthState();
        // Try auth check again after reset
        setTimeout(() => checkAuth(), 100);
      }
    }, 3000);

    return () => clearTimeout(resetTimeout);
  }, [user, isCheckingAuth, checkAuth, forceResetAuthState]);

  // Force show form after 2 seconds if still loading
  useEffect(() => {
    const forceShowTimeout = setTimeout(() => {
      if (isCheckingAuth && !user && !forceShowForm) {
        console.log('🚨 Forcing registration form to show - auth check taking too long');
        setForceShowForm(true);
      }
    }, 2000);

    return () => clearTimeout(forceShowTimeout);
  }, [isCheckingAuth, user, forceShowForm]);

  // Redirect if user doesn't need registration
  useEffect(() => {
    if (user) {
      // Check if user registration is complete
      const isRegistrationComplete = user.role !== 'pending' &&
        (user.role !== 'faculty' || (user.department && user.facultyId));

      if (isRegistrationComplete) {
        toast.success('Welcome back! Redirecting to your dashboard...');
        const route = getRoleBasedRoute();
        navigate(route, { replace: true });
      }
    }
  }, [user, navigate, getRoleBasedRoute]);

  const departments = [
    { value: "CSE", label: "Computer Science Engineering" },
    { value: "CSE-AIML", label: "CSE - Artificial Intelligence & Machine Learning" },
    { value: "CSE-DS", label: "CSE - Data Science" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 relative overflow-hidden flex items-center justify-center px-4">
      {/* Floating Shapes */}
      <FloatingShape color='bg-green-500' size='w-64 h-64' top='-5%' left='10%' delay={0} />
      <FloatingShape color='bg-emerald-500' size='w-48 h-48' top='70%' left='80%' delay={5} />
      <FloatingShape color='bg-lime-500' size='w-32 h-32' top='40%' left='-10%' delay={2} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden relative z-10"
      >
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
              Complete Registration
            </h2>
            <p className="text-gray-300">Step {step} of 3</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[1, 2, 3].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepNum <= step
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                      : 'bg-gray-600 text-gray-400'
                  }`}
                >
                  {stepNum < step ? <CheckCircle size={16} /> : stepNum}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step Content */}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          {/* Development only - Clear users button */}
          {import.meta.env.DEV && (
            <button
              onClick={clearUsers}
              className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
            >
              🗑️ Clear All Users (Dev Only)
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );

  // Step handlers
  function handleRoleSelect(selectedRole) {
    setRole(selectedRole);
    if (selectedRole === "security") {
      setStep(3); // Skip department selection for security
    } else {
      setStep(2); // Go to department selection for faculty
    }
  }

  function handleDepartmentSelect() {
    if (!department) {
      toast.error("Please select a department");
      return;
    }
    setStep(3);
  }

  async function handleCompleteRegistration() {
    if (role === "faculty" && (!department || !facultyId.trim())) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL}/auth`
        : import.meta.env.MODE === "development"
          ? "http://localhost:8000/api/auth"
          : "/api/auth";
      const response = await fetch(`${API_URL}/complete-registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          role,
          department: role === "faculty" ? department : undefined,
          facultyId: role === "faculty" ? facultyId.trim() : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Registration completed successfully!");
        // Refresh auth state and redirect
        await checkAuth();
        const route = getRoleBasedRoute();
        navigate(route, { replace: true });
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function clearUsers() {
    if (confirm('Are you sure you want to clear all users from the database? This cannot be undone.')) {
      try {
        const response = await fetch('/api/auth/clear-users', { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
          toast.success(`Cleared ${data.deletedCount} users from database`);
        } else {
          toast.error('Failed to clear users');
        }
      } catch (error) {
        toast.error('Error clearing users');
      }
    }
  }

  // Render functions
  function renderStep1() {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-center"
      >
        <h3 className="text-xl font-semibold text-white mb-2">Select Your Role</h3>
        <p className="text-gray-300 mb-6">Are you a Faculty member or Security personnel?</p>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect("faculty")}
            className="w-full p-6 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-4 border-2 border-transparent hover:border-green-500"
          >
            <GraduationCap className="w-8 h-8 text-green-400" />
            <div className="text-left">
              <div className="text-lg">Faculty</div>
              <div className="text-sm text-gray-300">Teaching staff member</div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect("security")}
            className="w-full p-6 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-4 border-2 border-transparent hover:border-emerald-500"
          >
            <Shield className="w-8 h-8 text-emerald-400" />
            <div className="text-left">
              <div className="text-lg">Security</div>
              <div className="text-sm text-gray-300">Security personnel</div>
            </div>
          </motion.button>
        </div>
      </motion.div>
    );
  }

  function renderStep2() {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-center"
      >
        <h3 className="text-xl font-semibold text-white mb-2">Select Department</h3>
        <p className="text-gray-300 mb-6">Choose your department</p>

        <div className="space-y-3 mb-8 max-h-60 overflow-y-auto">
          {departments.map((dept) => (
            <motion.button
              key={dept.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setDepartment(dept.value)}
              className={`w-full p-4 rounded-lg font-medium transition-colors text-left ${
                department === dept.value
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5" />
                {dept.label}
              </div>
            </motion.button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep(1)}
            className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleDepartmentSelect}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-colors"
          >
            Continue
          </button>
        </div>
      </motion.div>
    );
  }

  function renderStep3() {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-center"
      >
        <h3 className="text-xl font-semibold text-white mb-2">
          {role === "faculty" ? "Faculty Details" : "Complete Registration"}
        </h3>
        <p className="text-gray-300 mb-6">
          {role === "faculty"
            ? "Please enter your faculty ID"
            : "You're all set! Click continue to complete registration."
          }
        </p>

        {role === "faculty" && (
          <div className="mb-6">
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Faculty ID (e.g., FAC001)"
                value={facultyId}
                onChange={(e) => setFacultyId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>
        )}

        <div className="bg-gray-700 rounded-lg p-4 mb-6 text-left">
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            Registration Summary:
          </h4>
          <div className="space-y-2 text-gray-300">
            <div className="flex justify-between">
              <span>Role:</span>
              <span className="text-white capitalize">{role}</span>
            </div>
            {role === "faculty" && (
              <>
                <div className="flex justify-between">
                  <span>Department:</span>
                  <span className="text-white">{departments.find(d => d.value === department)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span>Faculty ID:</span>
                  <span className="text-white">{facultyId || "Not entered"}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep(role === "faculty" ? 2 : 1)}
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600/50 text-white rounded-lg font-medium transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleCompleteRegistration}
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-green-600/50 disabled:to-emerald-600/50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Completing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Complete Registration
              </>
            )}
          </button>
        </div>
      </motion.div>
    );
  }

  // Force show form after 2 seconds if still loading
  useEffect(() => {
    const forceShowTimeout = setTimeout(() => {
      if (isCheckingAuth && !user && !forceShowForm) {
        console.log('🚨 Forcing registration form to show - auth check taking too long');
        setForceShowForm(true);
      }
    }, 2000);

    return () => clearTimeout(forceShowTimeout);
  }, [isCheckingAuth, user, forceShowForm]);

  // Show loading while checking auth (with timeout fallback) - TEMPORARILY DISABLED FOR TESTING
  // if (isCheckingAuth && !user && !forceShowForm) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center px-4">
  //       <motion.div
  //         initial={{ opacity: 0, y: 20 }}
  //         animate={{ opacity: 1, y: 0 }}
  //         transition={{ duration: 0.5 }}
  //         className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden p-8 text-center"
  //       >
  //         <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
  //         <p className="text-white">Loading user data...</p>
  //       </motion.div>
  //     </div>
  //   );
  // }
};

export default CompleteRegistrationPage;
