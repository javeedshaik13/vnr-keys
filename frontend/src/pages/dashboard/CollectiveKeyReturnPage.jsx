import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  KeyRound, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  User, 
  Clock, 
  MapPin,
  RefreshCw
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useKeyStore } from "../../store/keyStore";
import { useSidebar } from "../../components/layout/DashboardLayout";


const CollectiveKeyReturnPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [isReturning, setIsReturning] = useState(false);
  const [takenKeys, setTakenKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


  const { sidebarOpen } = useSidebar();
  const { collectiveReturnKeyAPI, getAllTakenKeysAPI } = useKeyStore();

  // Fetch all taken keys on component mount
  useEffect(() => {
    fetchAllTakenKeys();
  }, [fetchAllTakenKeys]);

  const fetchAllTakenKeys = async () => {
    setIsLoading(true);
    try {
      const takenKeysData = await getAllTakenKeysAPI();
      setTakenKeys(takenKeysData);
    } catch (error) {
      console.error('Error fetching taken keys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter keys based on search query
  const filteredKeys = takenKeys.filter(key => 
    key.keyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    key.keyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    key.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    key.takenBy?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleKeySelect = (keyId) => {
    setSelectedKeys(prev =>
      prev.includes(keyId)
        ? prev.filter(id => id !== keyId)
        : [...prev, keyId]
    );
  };

  const handleSelectAll = () => {
    if (selectedKeys.length === filteredKeys.length && filteredKeys.length > 0) {
      setSelectedKeys([]);
    } else {
      setSelectedKeys(filteredKeys.map(key => key.id));
    }
  };

  const handleReturnKeys = () => {
    if (selectedKeys.length === 0) return;
    setShowConfirmModal(true);
  };

  const confirmReturn = async () => {
    setIsReturning(true);
    try {
      const returnPromises = selectedKeys.map(keyId =>
        collectiveReturnKeyAPI(keyId, returnReason || 'Collective key return')
      );

      await Promise.all(returnPromises);

      // Refresh the taken keys list
      await fetchAllTakenKeys();

      // Reset state
      setSelectedKeys([]);
      setReturnReason("");
      setShowConfirmModal(false);
    } catch (error) {
      console.error('Error returning keys:', error);
    } finally {
      setIsReturning(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeSinceTaken = (takenAt) => {
    const now = new Date();
    const taken = new Date(takenAt);
    const diffInHours = Math.floor((now - taken) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Less than 1 hour ago";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  if (isLoading) {
    return (
      <div className={`p-6 transition-all duration-300 ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
          <span className="ml-2 text-gray-300">Loading taken keys...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 transition-all duration-300 ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Collective Key Return
            </h1>
            <p className="text-gray-400">
              Return keys on behalf of other users. Available to Security and Faculty.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchAllTakenKeys}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Search and Actions */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by key number, name, location, or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {selectedKeys.length === filteredKeys.length && filteredKeys.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
            
            {selectedKeys.length > 0 && (
              <button
                onClick={handleReturnKeys}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                <KeyRound className="w-4 h-4" />
                <span>Return {selectedKeys.length} Key{selectedKeys.length > 1 ? 's' : ''}</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Taken Keys</p>
              <p className="text-2xl font-bold text-white">{takenKeys.length}</p>
            </div>
            <KeyRound className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Selected for Return</p>
              <p className="text-2xl font-bold text-white">{selectedKeys.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Filtered Results</p>
              <p className="text-2xl font-bold text-white">{filteredKeys.length}</p>
            </div>
            <Search className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </motion.div>

      {/* Keys List */}
      <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
          >
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Currently Taken Keys</h2>
          <p className="text-gray-400 mt-1">
            {filteredKeys.length} of {takenKeys.length} keys shown
          </p>
        </div>

        {filteredKeys.length === 0 ? (
          <div className="p-8 text-center">
            <KeyRound className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              {searchQuery ? 'No keys match your search criteria' : 'No keys are currently taken'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredKeys.map((key, index) => (
              <motion.div
                key={key.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`p-6 hover:bg-gray-750 transition-colors cursor-pointer ${
                  selectedKeys.includes(key.id) ? 'bg-orange-900/20 border-l-4 border-orange-400' : ''
                }`}
                onClick={() => handleKeySelect(key.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer ${
                      selectedKeys.includes(key.id)
                        ? 'bg-orange-400 border-orange-400'
                        : 'border-gray-500 hover:border-gray-400'
                    }`}>
                      {selectedKeys.includes(key.id) && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-white">
                          {key.keyNumber}
                        </h3>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-300">{key.keyName}</span>
                      </div>

                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{key.location}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{key.takenBy?.name || 'Unknown User'}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{getTimeSinceTaken(key.takenAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-400">Taken on</p>
                    <p className="text-sm text-white">{formatDate(key.takenAt)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700"
          >
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
              <h3 className="text-lg font-semibold text-white">Confirm Collective Return</h3>
            </div>

            <p className="text-gray-300 mb-4">
              You are about to return {selectedKeys.length} key{selectedKeys.length > 1 ? 's' : ''}
              on behalf of other users. This action will be logged for audit purposes.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reason for collective return (optional)
              </label>
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="e.g., End of day collection, Emergency return, etc."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                rows={3}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isReturning}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmReturn}
                disabled={isReturning}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isReturning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Returning...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm Return</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CollectiveKeyReturnPage;
