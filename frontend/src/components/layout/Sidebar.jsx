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
      setIsMobile(window.innerWidth < 1024);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const baseMenuItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: User, label: "Profile", path: "/dashboard/profile" },
    { icon: Info, label: "About Us", path: "/dashboard/about" },
  ];

  const adminMenuItems = [
    { icon: Users, label: "Manage Users", path: "/dashboard/admin/users" },
    { icon: Shield, label: "Security Settings", path: "/dashboard/admin/security" },
    { icon: BarChart3, label: "View Reports", path: "/dashboard/admin/reports" },
  ];

  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 40 } },
    closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 40 } },
  };

  const overlayVariants = { open: { opacity: 1 }, closed: { opacity: 0 } };

  if (!isMobile && !sidebarOpen) return null;

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
        style={{background: "radial-gradient(circle at 50% 30%, #1e293b 0%, #0f172a 100%)"}}
        className={`${
          isMobile
            ? "fixed left-0 top-[64px] h-[calc(100%-64px)] w-64 z-50"
            : "relative w-64 h-[calc(100vh-4rem)]"
        } backdrop-blur-xl border border-gray-700 rounded-2xl shadow-lg transition-all duration-300`}
      >
        <div className="flex flex-col h-full">
          <nav className="flex-1 p-4">
            <ul className="space-y-3">
              {baseMenuItems.map((item, index) => (
                <motion.li
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <NavLink
  to={item.path}
  end={item.path === "/dashboard"} // ✅ exact match for Home
  onClick={() => isMobile && setSidebarOpen(false)}
  className={({ isActive }) =>
    `flex items-center space-x-3 p-3 rounded-2xl transition-all duration-300 border border-gray-700 text-gray-300
      ${isActive ? "text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.7)]" : "hover:text-white hover:border-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"}`
  }
>
  <item.icon size={20} />
  <span className="font-medium">{item.label}</span>
</NavLink>

                </motion.li>
              ))}

              {user?.role === "admin" &&
                adminMenuItems.map((item, index) => (
                  <motion.li
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (baseMenuItems.length + index) * 0.1 }}
                  >
                    <NavLink
                      to={item.path}
                      onClick={() => isMobile && setSidebarOpen(false)}
                      className="flex items-center space-x-3 p-3 rounded-2xl transition-all duration-300 shadow-sm border border-gray-700 text-gray-300 hover:text-white hover:border-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                    >
                      <item.icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </NavLink>
                  </motion.li>
                ))}
            </ul>
          </nav>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
