import { motion, AnimatePresence } from "framer-motion";
import { Home, User, Mail, Info, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const menuItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: User, label: "Profile", path: "/dashboard/profile" },
    { icon: Mail, label: "Contact Us", path: "/dashboard/contact" },
    { icon: Info, label: "About Us", path: "/dashboard/about" },
  ];

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 40,
      },
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 40,
      },
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
            ? "fixed left-0 top-0 h-full w-64 z-50"
            : "relative w-64 h-[calc(100vh-4rem)]"
        } bg-gray-900 bg-opacity-95 backdrop-filter backdrop-blur-lg border-r border-gray-800`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b border-gray-800 ${isMobile ? 'block' : 'hidden'}`}>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <h2 className="text-lg font-bold text-white">Dashboard</h2>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
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
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800">
            <div className="text-center text-xs text-gray-400">
              <p>Hackathon Dashboard v1.0</p>
              <p className="mt-1">© 2024 Your Team</p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;