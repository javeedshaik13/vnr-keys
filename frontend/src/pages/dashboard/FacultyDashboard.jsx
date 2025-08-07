import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Key, List, Search, Star, QrCode, X } from "lucide-react";
import { useKeyStore } from "../../store/keyStore";
import { useAuthStore } from "../../store/authStore";
import BottomNavigation from "../../components/ui/BottomNavigation";
import KeyCard from "../../components/keys/KeyCard";
import QRCode from "react-qr-code";

const FacultyDashboard = () => {
  const [activeTab, setActiveTab] = useState("taken");
  const [searchQuery, setSearchQuery] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState(null);

  const { user } = useAuthStore();
  const {
    keys,
    getTakenKeys,
    getFrequentlyUsedKeys,
    searchKeys,
    generateKeyRequestQR,
    generateKeyReturnQR,
    toggleFrequentlyUsed,
    isLoading,
    error
  } = useKeyStore();

  const takenKeys = getTakenKeys(user?.id || "user-1"); // Mock user ID for demo
  const frequentlyUsedKeys = getFrequentlyUsedKeys();
  const searchResults = searchKeys(searchQuery);

  const tabs = [
    {
      id: "taken",
      label: "Taken Keys",
      icon: <Key className="w-6 h-6" />,
      badge: takenKeys.length > 0 ? takenKeys.length : null,
    },
    {
      id: "keylist",
      label: "Key List",
      icon: <List className="w-6 h-6" />,
    },
  ];

  const handleRequestKey = async (keyId) => {
    try {
      const qrData = await generateKeyRequestQR(keyId, user?.id || "user-1");
      setQrData(qrData);
      setShowQRModal(true);
    } catch (error) {
      console.error("Request key error:", error);
    }
  };

  const handleReturnKey = async (keyId) => {
    try {
      const qrData = await generateKeyReturnQR(keyId, user?.id || "user-1");
      return qrData;
    } catch (error) {
      console.error("Return key error:", error);
      return null;
    }
  };

  const handleToggleFrequent = async (keyId) => {
    try {
      await toggleFrequentlyUsed(keyId);
    } catch (error) {
      console.error("Toggle frequent error:", error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "taken":
        return (
          <div className="flex-1 p-4 pb-20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">My Keys</h2>
              <div className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium border border-blue-600/30">
                {takenKeys.length} Taken
              </div>
            </div>

            {takenKeys.length === 0 ? (
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
                    qrData={handleReturnKey(key.id)}
                    showQR={true}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case "keylist":
        return (
          <div className="flex-1 p-4 pb-20">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search keys..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Frequently Used Keys */}
            {!searchQuery && frequentlyUsedKeys.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">Frequently Used</h3>
                </div>
                <div className="space-y-3">
                  {frequentlyUsedKeys.map((key) => (
                    <KeyCard
                      key={key.id}
                      keyData={key}
                      variant="default"
                      onRequestKey={handleRequestKey}
                      onToggleFrequent={handleToggleFrequent}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Keys */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                {searchQuery ? `Search Results (${searchResults.length})` : "All Keys"}
              </h3>

              {(searchQuery ? searchResults : keys).length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">
                    {searchQuery ? "No keys found" : "No keys available"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(searchQuery ? searchResults : keys)
                    .filter(key => !searchQuery || !frequentlyUsedKeys.some(fk => fk.id === key.id))
                    .map((key) => (
                      <KeyCard
                        key={key.id}
                        keyData={key}
                        variant="default"
                        onRequestKey={handleRequestKey}
                        onToggleFrequent={handleToggleFrequent}
                      />
                    ))}
                </div>
              )}
            </div>
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
        onTabChange={setActiveTab}
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
              <h3 className="text-xl font-bold text-gray-900">Request Key</h3>
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
                Show this QR code to security to request the key
              </p>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-500">Request ID:</p>
                <p className="text-xs font-mono text-gray-700 break-all">
                  {qrData.requestId}
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