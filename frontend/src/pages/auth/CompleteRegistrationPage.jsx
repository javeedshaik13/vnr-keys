import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  GraduationCap,
  Shield,
  User,
  Building,
  IdCard,
  CheckCircle,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

const CompleteRegistrationPage = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [forceShowForm, setForceShowForm] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    user,
    checkAuth,
    getRoleBasedRoute,
    isCheckingAuth,
    forceResetAuthState,
  } = useAuthStore();
  const hasShownAuthToast = useRef(false);

  useEffect(() => {
    let isSubscribed = true;
    const authStatus = searchParams.get("auth");
    if (authStatus === "success" && !hasShownAuthToast.current) {
      toast.success("Successfully authenticated with Google!");
      hasShownAuthToast.current = true;
      window.history.replaceState({}, "", window.location.pathname);
    }

    if (!user && !isCheckingAuth) {
      checkAuth();
    }

    const resetTimeout = setTimeout(() => {
      if (isCheckingAuth && !user && isSubscribed) {
        forceResetAuthState();
        setTimeout(() => isSubscribed && checkAuth(), 100);
      }
    }, 3000);

    const forceShowTimeout = setTimeout(() => {
      if (isCheckingAuth && !user && !forceShowForm && isSubscribed) {
        setForceShowForm(true);
      }
    }, 2000);

    return () => {
      isSubscribed = false;
      clearTimeout(resetTimeout);
      clearTimeout(forceShowTimeout);
    };
  }, [searchParams, user, isCheckingAuth, checkAuth, forceResetAuthState, forceShowForm]);

  useEffect(() => {
    if (user) {
      const isRegistrationComplete =
        user.role !== "pending" &&
        (user.role !== "faculty" || (user.department && user.facultyId));

      if (isRegistrationComplete) {
        toast.success("Welcome back! Redirecting to your dashboard...");
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden relative z-10">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">
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
                      ? "bg-gradient-to-r from-blue-400 to-indigo-500 text-white"
                      : "bg-gray-600 text-gray-400"
                  }`}
                >
                  {stepNum < step ? <CheckCircle size={16} /> : stepNum}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step Content */}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
  </div>
    </div>
  );

  function handleRoleSelect(selectedRole) {
    setRole(selectedRole);
    if (selectedRole === "security") {
      setStep(3);
    } else {
      setStep(2);
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
        ? "http://localhost:6203/api/auth"
        : "/api/auth";
      const response = await fetch(`${API_URL}/complete-registration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  // Development utility retained for reference; disable unused var linting via comment
  /* eslint-disable no-unused-vars */
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
  /* eslint-enable no-unused-vars */

  function renderStep1() {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Select Your Role</h3>
        <p className="text-gray-300 mb-6">Are you a Faculty member or Security personnel?</p>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect("faculty")}
            className="w-full p-6 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-semibold flex items-center justify-center gap-4 border-2 border-transparent hover:border-blue-500"
          >
            <GraduationCap className="w-8 h-8 text-blue-400" />
            <div className="text-left">
              <div className="text-lg">Faculty</div>
              <div className="text-sm text-gray-300">Teaching staff member</div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect("security")}
            className="w-full p-6 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-semibold flex items-center justify-center gap-4 border-2 border-transparent hover:border-indigo-500"
          >
            <Shield className="w-8 h-8 text-indigo-400" />
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
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Select Department</h3>
        <p className="text-gray-300 mb-6">Choose your department</p>

        <div className="space-y-3 mb-8 max-h-60 overflow-y-auto">
          {departments.map((dept) => (
            <motion.button
              key={dept.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setDepartment(dept.value)}
              className={`w-full p-4 rounded-lg font-medium text-left ${
                department === dept.value
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
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
            className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
          >
            Back
          </button>
          <button
            onClick={handleDepartmentSelect}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-medium"
          >
            Continue
          </button>
        </div>
      </motion.div>
    );
  }

  function renderStep3() {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">
          {role === "faculty" ? "Faculty Details" : "Complete Registration"}
        </h3>
        <p className="text-gray-300 mb-6">
          {role === "faculty"
            ? "Please enter your faculty ID"
            : "You're all set! Click continue to complete registration."}
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
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                  <span className="text-white">
                    {departments.find((d) => d.value === department)?.label}
                  </span>
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
            className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600/50 text-white rounded-lg font-medium"
          >
            Back
          </button>
          <button
            onClick={handleCompleteRegistration}
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-blue-600/50 disabled:to-indigo-600/50 text-white rounded-lg font-medium flex items-center justify-center gap-2"
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
};

export default CompleteRegistrationPage;
