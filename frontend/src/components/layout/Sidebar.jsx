import { motion, AnimatePresence } from "framer-motion";
import { Home, User, Info, Users, Shield, BarChart3 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Base menu items for all users
  const baseMenuItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: User, label: "Profile", path: "/dashboard/profile" },
    { icon: Info, label: "About Us", path: "/dashboard/about" },
  ];

  // Admin-specific menu items
  const adminMenuItems = [
    { icon: Users, label: "Manage Users", path: "/dashboard/admin/users" },
    { icon: Shield, label: "Security Settings", path: "/dashboard/admin/security" },
    { icon: BarChart3, label: "View Reports", path: "/dashboard/admin/reports" },
  ];

  const sidebarVariants = {
    open: {
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 40 },
    },
    closed: {
      x: "-100%",
      transition: { type: "spring", stiffness: 300, damping: 40 },
    },
  };

  const overlayVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 },
  };

  // Don't render sidebar on desktop when closed
  if (!isMobile && !sidebarOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={isMobile ? "closed" : "open"}
        animate={sidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className={`${
          isMobile
            ? "fixed left-0 top-[64px] h-[calc(100%-64px)] w-64 z-50" // 👈 shifted below navbar
            : "relative w-64 h-[calc(100vh-4rem)]"
        } bg-gray-900 bg-opacity-95 backdrop-filter backdrop-blur-lg border-r border-gray-800`}
      >
        <div className="flex flex-col h-full">
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {/* Base menu items */}
              {baseMenuItems.map((item, index) => (
                <motion.li
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <NavLink
                    to={item.path}
                    onClick={() => isMobile && setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                          : "text-gray-300 hover:text-white hover:bg-gray-800"
                      }`
                    }
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                </motion.li>
              ))}

              {/* Admin menu items */}
              {user && user.role === "admin" && (
                <>
                  {adminMenuItems.map((item, index) => (
                    <motion.li
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: (baseMenuItems.length + index) * 0.1,
                      }}
                    >
                      <NavLink
                        to={item.path}
                        onClick={() => isMobile && setSidebarOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                            isActive
                              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                              : "text-gray-300 hover:text-white hover:bg-gray-800"
                          }`
                        }
                      >
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                      </NavLink>
                    </motion.li>
                  ))}
                </>
              )}
            </ul>
          </nav>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;