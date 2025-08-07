import { motion } from "framer-motion";
import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { formatDate } from "../../utils/date";
import { User, Mail, Calendar, Edit3, Save, X, Camera } from "lucide-react";
import toast from "react-hot-toast";
import { useSidebar } from "../../components/layout/DashboardLayout";

const ProfilePage = () => {
  const { user, updateProfile, isLoading } = useAuthStore();
  const { sidebarOpen } = useSidebar();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
    location: user?.location || "",
    website: user?.website || "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      // Error handling is done in the auth store
      console.error("Profile update failed:", error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      bio: user?.bio || "",
      location: user?.location || "",
      website: user?.website || "",
    });
    setIsEditing(false);
  };

  return (
    <div className={`space-y-6 ${sidebarOpen ? 'p-4 lg:p-6' : 'p-4 lg:p-8 xl:px-12'}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text mb-4">
          Profile Settings
        </h1>
        <p className="text-gray-300">
          Manage your account information and preferences
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800">
            <div className="text-center">
              {/* Profile Picture */}
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-gray-800 rounded-full border-2 border-gray-700 hover:bg-gray-700 transition-colors duration-200">
                  <Camera size={16} className="text-gray-300" />
                </button>
              </div>

              <h2 className="text-xl font-bold text-white mb-1">{user?.name}</h2>
              <p className="text-gray-400 mb-4">{user?.email}</p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">12</p>
                  <p className="text-gray-400 text-sm">Projects</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">48</p>
                  <p className="text-gray-400 text-sm">Tasks</p>
                </div>
              </div>

              {/* Account Info */}
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3 p-3 bg-gray-800 bg-opacity-50 rounded-lg">
                  <Calendar size={16} className="text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-xs">Member since</p>
                    <p className="text-white text-sm">
                      {new Date(user?.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-800 bg-opacity-50 rounded-lg">
                  <User size={16} className="text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-xs">Last login</p>
                    <p className="text-white text-sm">{formatDate(user?.lastLogin)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Personal Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                >
                  <Edit3 size={16} />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                  >
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="City, Country"
                    className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                />
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
