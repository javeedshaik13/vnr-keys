import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Key, KeyRound, List, X, RefreshCw } from "lucide-react";
import { useKeyStore } from "../../store/keyStore";
import { useAuthStore } from "../../store/authStore";
import BottomNavigation from "../../components/ui/BottomNavigation";
import KeyCard from "../../components/keys/KeyCard";
import QRCode from "react-qr-code";
import SearchBar from "../../components/keys/SearchBar";
import SearchResults from "../../components/keys/SearchResults";
import FrequentlyUsedSection from "../../components/keys/FrequentlyUsedSection";
import DepartmentsSection from "../../components/keys/DepartmentsSection";
import DepartmentView from "../../components/keys/DepartmentView";

const FacultyDashboard = () => {
  const [activeTab, setActiveTab] = useState("taken");
  const [searchQuery, setSearchQuery] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const { user } = useAuthStore();
  const {
    keys,
    frequentlyUsedKeys,
    usageCounts,
    getTakenKeys,
    generateKeyRequestQR,
    generateKeyReturnQR,
    fetchKeys,
    fetchTakenKeys,
    fetchUserFrequentlyUsedKeys,
    isLoadingTakenKeys,
    isLoadingFrequentlyUsed
  } = useKeyStore();

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === "taken" && user) {
      console.log('🔄 Switching to taken tab, refreshing taken keys');
      fetchTakenKeys(user.id).catch(console.error);
    }
  };

  // Fetch keys on component mount
  useEffect(() => {
    if (user) {
      console.log('🔑 FacultyDashboard: User authenticated:', user);
      console.log('🔑 FacultyDashboard: User ID:', user.id);
      fetchKeys().catch(console.error);
      fetchTakenKeys(user.id).catch(console.error);
      fetchUserFrequentlyUsedKeys().catch(console.error);
    } else {
      console.log('❌ FacultyDashboard: No user found');
    }
  }, [user, fetchKeys, fetchTakenKeys, fetchUserFrequentlyUsedKeys]);

  const takenKeys = getTakenKeys(user?.id);
  console.log('🔑 FacultyDashboard: Taken keys count:', takenKeys.length);
  console.log('🔑 FacultyDashboard: All keys count:', keys.length);
  console.log('🔑 FacultyDashboard: User ID being used:', user?.id);

  const tabs = [
    {
      id: "taken",
      label: "My Keys",
      icon: <KeyRound className="w-6 h-6" />,
      badge: takenKeys.length > 0 ? takenKeys.length : null,
    },
    {
      id: "keylist",
      label: "All Keys",
      icon: <List className="w-6 h-6" />,
    },
  ];

  const handleRequestKey = async (keyId) => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated or user ID missing');
      }

      if (!keyId) {
        throw new Error('Key ID is required');
      }

      // Generate QR code for key request
      const qrData = await generateKeyRequestQR(keyId, user.id);
      setQrData(qrData);
      setShowQRModal(true);
    } catch (error) {
      console.error("Request key error:", error);
      // Show error to user
      alert(`Error generating QR code: ${error.message}`);
    }
  };

  const handleReturnKey = async (keyId) => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated or user ID missing');
      }

      if (!keyId) {
        throw new Error('Key ID is required');
      }

      const qrData = await generateKeyReturnQR(keyId, user.id);
      // Don't set global modal state - let KeyCard handle its own modal
      return qrData;
    } catch (error) {
      console.error("Return key error:", error);
      // Show error to user
      alert(`Error generating QR code: ${error.message}`);
      return null;
    }
  };

  const handleToggleFrequent = async (keyId) => {
    // This function is no longer needed as we're using usage-based frequently used keys
    console.log("Toggle frequent function deprecated - using usage-based frequently used keys");
  };

  const handleDepartmentClick = (department) => {
    setSelectedDepartment(department);
  };

  const handleBackToDepartments = () => {
    setSelectedDepartment(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "taken":
        return (
          <div className="flex-1 p-4 pb-20">
            {/* Global Search Bar */}
            <SearchBar 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
            />

            {/* Global Search Results Section - Only show when search is active */}
            {searchQuery.trim() && (
              <SearchResults
                searchQuery={searchQuery}
                keys={keys}
                onRequestKey={handleRequestKey}
                onToggleFrequent={handleToggleFrequent}
                onReturnKey={handleReturnKey}
                userRole="faculty"
              />
            )}

            {/* My Keys Section - Only show when no search is active */}
            {!searchQuery.trim() && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">My Keys</h2>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium border border-blue-600/30">
                      {takenKeys.length} Taken
                    </div>
                    <button
                      onClick={() => fetchTakenKeys(user?.id)}
                      disabled={isLoadingTakenKeys}
                      className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg border border-blue-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Refresh taken keys"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingTakenKeys ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {isLoadingTakenKeys ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">Loading taken keys...</p>
                  </div>
                ) : takenKeys.length === 0 ? (
                  <div className="text-center py-12">
                    <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No keys taken</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Go to Key List to request keys
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {takenKeys.map((key) => (
                      <KeyCard
                        key={key.id}
                        keyData={key}
                        variant="taken"
                        onReturnKey={handleReturnKey}
                        showQR={false}
                        userRole="faculty"
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        );

      case "keylist":
        return (
          <div className="flex-1 p-4 pb-20">
            {/* Global Search Bar */}
            <SearchBar 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
            />

            {/* Global Search Results Section - Only show when outside departments and search is active */}
            {!selectedDepartment && searchQuery.trim() && (
              <SearchResults
                searchQuery={searchQuery}
                keys={keys}
                onRequestKey={handleRequestKey}
                onToggleFrequent={handleToggleFrequent}
                onReturnKey={handleReturnKey}
                userRole="faculty"
              />
            )}

            {/* Department View or Main Content */}
            {selectedDepartment ? (
              <DepartmentView
                department={selectedDepartment}
                keys={keys}
                searchQuery={searchQuery}
                onRequestKey={handleRequestKey}
                onToggleFrequent={handleToggleFrequent}
                onBack={handleBackToDepartments}
              />
            ) : (
              <>
                {/* Frequently Used Keys Section */}
                <FrequentlyUsedSection
                  keys={frequentlyUsedKeys}
                  availabilityFilter="all"
                  onRequestKey={handleRequestKey}
                  usageCounts={usageCounts}
                />

                {/* Departments Section */}
                <DepartmentsSection
                  keys={keys}
                  onDepartmentClick={handleDepartmentClick}
                  selectedDepartment={selectedDepartment}
                />
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Faculty Dashboard</h1>
            <p className="text-gray-300">Welcome, {user?.name}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-2">
            <span className="text-green-400 font-medium">Online</span>
          </div>
        </div>
      </div>

      {/* Content */}
      {renderTabContent()}

      {/* Bottom Navigation */}
      <BottomNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* QR Request Modal */}
      {showQRModal && qrData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-sm w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {qrData?.type === 'key-return' ? 'Return Key' : 'Request Key'}
              </h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <QRCode value={JSON.stringify(qrData)} size={200} />
              </div>
              <p className="text-gray-600 mb-4">
                {qrData.type === 'key-request'
                  ? 'Show this QR code to security to request the key'
                  : 'Show this QR code to security to return the key'
                }
              </p>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-500">
                  {qrData.type === 'key-request' ? 'Request ID:' : 'Return ID:'}
                </p>
                <p className="text-xs font-mono text-gray-700 break-all">
                  {qrData.requestId || qrData.returnId}
                </p>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;