import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { QrCode, Key, KeyRound, CheckCircle, XCircle } from "lucide-react";
import { useKeyStore } from "../../store/keyStore";
import { useAuthStore } from "../../store/authStore";
import BottomNavigation from "../../components/ui/BottomNavigation";
import KeyCard from "../../components/keys/KeyCard";
import QRScanner from "../../components/keys/QRScanner";
import SearchBar from "../../components/keys/SearchBar";
import SearchResults from "../../components/keys/SearchResults";
import DepartmentsSection from "../../components/keys/DepartmentsSection";
import DepartmentView from "../../components/keys/DepartmentView";
import { processQRScanRequest, validateQRData, parseQRString } from "../../services/qrService";
import { config } from "../../utils/config";

const SecurityDashboard = () => {
  const [activeTab, setActiveTab] = useState("scanner");
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [showScanResult, setShowScanResult] = useState(false);
  const [showReturnConfirmation, setShowReturnConfirmation] = useState(false);
  const [pendingReturnData, setPendingReturnData] = useState(null);
  // Removed unused isProcessing state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const { user } = useAuthStore();
  const {
    keys,
    getAvailableKeys,
    getUnavailableKeys,
    fetchKeys,
    returnKeyAPI
  } = useKeyStore();

  // Fetch keys on component mount
  useEffect(() => {
    if (user) {
      fetchKeys().catch(console.error);
    }
  }, [user, fetchKeys]);

  const availableKeys = getAvailableKeys();
  const unavailableKeys = getUnavailableKeys();

  const handleDepartmentClick = (department) => {
    setSelectedDepartment(department);
  };

  const handleBackToListing = () => {
    setSelectedDepartment(null);
  };

  const tabs = [
    {
      id: "scanner",
      label: "QR Scanner",
      icon: <QrCode className="w-6 h-6" />,
    },
    {
      id: "available",
      label: "Available Keys",
      icon: <Key className="w-6 h-6" />,
      badge: availableKeys.length,
    },
    {
      id: "unavailable",
      label: "Unavailable Keys",
      icon: <KeyRound className="w-6 h-6" />,
      badge: unavailableKeys.length,
    },
  ];

  const handleQRScan = async (qrData) => {
    // Keep parsedData accessible in catch for additional context (e.g., expired QR)
    let parsedData = qrData;
    try {
      console.log('QR scan received:', qrData);

      // Parse QR data if it's a string
      if (typeof qrData === 'string') {
        parsedData = parseQRString(qrData);
      }

      // Validate QR data
      const validation = validateQRData(parsedData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Handle different QR code types
      if (validation.type === 'key-return') {
        // For returns, fetch key and user details first, then show confirmation dialog
        try {
          console.log('🔍 Fetching details for keyId:', parsedData.keyId, 'userId:', parsedData.userId);

          // Create proper API URLs using configured backend base URL
          const keyUrl = `${config.api.keysUrl}/${parsedData.keyId}`;
          const userUrl = `${config.api.authUrl}/user/${parsedData.userId}`;

          console.log('🔍 Key URL:', keyUrl);
          console.log('🔍 User URL:', userUrl);

          const [keyResponse, userResponse] = await Promise.all([
            axios.get(keyUrl, { withCredentials: true }),
            axios.get(userUrl, { withCredentials: true })
          ]);

          let keyData = null;
          let userData = null;

          console.log('🔍 Key response status:', keyResponse.status);
          console.log('🔍 User response status:', userResponse.status);

          // Axios wraps data under .data
          const keyResult = keyResponse.data;
          const userResult = userResponse.data;
          console.log('🔍 Key result:', keyResult);
          console.log('🔍 User result:', userResult);

          // Handle nested data structure: keyResult.data.key
          keyData = keyResult?.data?.key || keyResult?.data || keyResult;
          userData = userResult?.user || userResult?.data || userResult;
          console.log('🔍 Extracted keyData:', keyData);
          console.log('🔍 Extracted userData:', userData);

          // Extract data with multiple fallback strategies
          const extractedKeyNumber = keyData?.keyNumber || keyData?.number || 'Unknown';
          const extractedKeyName = keyData?.keyName || keyData?.name || 'Unknown Key';
          const extractedUserName = userData?.name || userData?.username || userData?.displayName || 'Unknown User';
          const extractedUserEmail = userData?.email || userData?.emailAddress || 'Unknown Email';

          // Create display data with fallbacks
          const displayData = {
            ...parsedData,
            keyNumber: extractedKeyNumber,
            keyName: extractedKeyName,
            keyFullName: (extractedKeyNumber !== 'Unknown' && extractedKeyName !== 'Unknown Key')
              ? `key ${extractedKeyNumber} , ${extractedKeyName}`
              : `Key #${parsedData.keyId.substring(0, 8)}...`,
            userName: extractedUserName,
            userEmail: extractedUserEmail
          };

          console.log('🔍 Final display data:', displayData);

          setPendingReturnData(displayData);
          setShowReturnConfirmation(true);
          setShowScanner(false);
        } catch (error) {
          console.error("Error fetching key/user details:", error);

          // Show confirmation with basic data and shortened ID
          const shortKeyId = parsedData.keyId.substring(0, 8);
          const shortUserId = parsedData.userId.substring(0, 8);

          setPendingReturnData({
            ...parsedData,
            keyNumber: 'Unknown',
            keyName: 'Unknown Key',
            keyFullName: `Key #${shortKeyId}...`,
            userName: `User #${shortUserId}...`,
            userEmail: 'Unknown Email'
          });
          setShowReturnConfirmation(true);
          setShowScanner(false);
        }
      } else if (validation.type === 'key-request') {
        // For requests, process immediately as before
        const result = await processQRScanRequest(parsedData);
        setScanResult({
          success: true,
          message: result.message,
          keyData: {
            ...result.data.key,
            keyNumber: result.data.key.keyNumber,
            keyName: result.data.key.keyName,
            takenBy: result.data.originalUser || result.data.requestedBy, // The person who requested the key
            givenBy: result.data.scannedBy    // The security person who gave it
          },
          type: 'request'
        });
        setShowScanResult(true);
        setShowScanner(false);
      } else {
        throw new Error('Unsupported QR code type');
      }
    } catch (error) {
      console.error("QR scan error:", error);

      // Try to enrich error modal with key details if QR is expired but contains a keyId
      let enrichedKeyData = null;
      try {
        const isExpired = (error?.message || '').toLowerCase().includes('expired');
        if (isExpired && parsedData && parsedData.keyId) {
          const keyUrl = `${config.api.keysUrl}/${parsedData.keyId}`;
          const keyResponse = await axios.get(keyUrl, { withCredentials: true });
          const keyResult = keyResponse.data;
          const keyData = keyResult?.data?.key || keyResult?.data || keyResult;
          if (keyData) {
            enrichedKeyData = {
              keyNumber: keyData.keyNumber || keyData.number,
              keyName: keyData.keyName || keyData.name
            };
          }
        }
      } catch (e) {
        // If enrichment fails, continue with generic error info
        console.warn('Failed to enrich expired QR error with key details:', e);
      }

      setScanResult({
        success: false,
        message: error.message || 'Failed to process QR code',
        type: 'error',
        keyData: enrichedKeyData || undefined
      });
      setShowScanResult(true);
      setShowScanner(false);
    }
  };

  // Removed unused handleCollectReturn function


  const handleCloseScanResult = () => {
    const wasRejected = scanResult?.type === 'rejected';
    const wasReturnSuccess = scanResult?.type === 'return';
    setShowScanResult(false);
    if (wasRejected || wasReturnSuccess) {
      // Re-open the scanner so security can continue scanning
      setShowScanner(true);
    }
  };

  const handleCollectKey = async (keyId) => {
    try {
      await returnKeyAPI(keyId);
    } catch (error) {
      console.error("Collect key error:", error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "scanner":
        return (
          <div className="flex-1 p-4 pb-20">
            {/* QR Scanner Section - Focused solely on scanning functionality */}
            <div className="text-center max-w-sm mx-auto mt-8 mb-8">
              <QrCode className="w-24 h-24 text-blue-400 mx-auto mb-6" />

              <h2 className="text-2xl font-bold text-white mb-4">QR Scanner</h2>
              <p className="text-gray-300 mb-8">
                Scan QR codes from faculty to approve key requests or returns
              </p>
              <button
  onClick={() => setShowScanner(true)}
  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors flex items-center gap-3 mx-auto shadow-lg shadow-blue-500/30"
>
  <QrCode className="w-6 h-6 text-blue-200" />
  Start Scanning
</button>

            </div>
          </div>
        );

      case "available":
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
                onCollectKey={handleCollectKey}
                userRole="security"
              />
            )}

            {/* Department View or Main Content */}
            {selectedDepartment ? (
              <DepartmentView
                department={selectedDepartment}
                keys={keys}
                searchQuery={searchQuery} // Pass search query to filter department keys
                onRequestKey={() => {}} // Security doesn't request keys
                onToggleFrequent={() => {}} // Not applicable for security
                onBack={handleBackToListing}
                userRole="security"
              />
            ) : (
              <>
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

      case "unavailable":
        return (
          <div className="flex-1 p-4 pb-20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Unavailable Keys</h2>
              <div className="bg-red-600/20 text-red-300 px-3 py-1 rounded-full text-sm font-medium border border-red-600/30">
                {unavailableKeys.length} Unavailable
              </div>
            </div>

            {unavailableKeys.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">All keys are available!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {unavailableKeys.map((key) => (
                  <KeyCard
                    key={key.id}
                    keyData={key}
                    variant="unavailable"
                    onCollectKey={handleCollectKey}
                    userRole="security"
                  />
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Security Dashboard</h1>
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

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
          isOpen={showScanner}
        />
      )}

      {/* Scan Result Modal */}
      {showScanResult && scanResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-sm w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{scanResult.success ? 'Success' : 'Error'}</h3>
              <button
                onClick={() => setShowScanResult(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                {/* Close icon could go here */}
              </button>
            </div>

            <div className="text-center">
              {scanResult.success ? (
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              )}
              <p className="text-gray-700 mb-2">{scanResult.message}</p>
            </div>

            <div className="mt-4">
              <button
                onClick={handleCloseScanResult}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Return Confirmation Modal */}
      {showReturnConfirmation && pendingReturnData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl p-6 max-w-sm w-full ${(!scanResult.success || scanResult.type === 'error') ? 'bg-red-50' : 'bg-white'}`}
          >
            <div className="text-center">
              {console.log('🔍 Scan Result Data:', scanResult)}
              {console.log('🔍 Key Data:', scanResult.keyData)}
              {console.log('🔍 Returned By:', scanResult.keyData?.returnedBy)}
              {scanResult.type === 'rejected' ? (
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              ) : (
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              )}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Key {scanResult.keyData?.keyNumber || scanResult.key?.keyNumber || 'Unknown'}
              </h3>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">
                ({scanResult.keyData?.keyName || scanResult.key?.keyName || 'Unknown Key'})
              </h4>

              {/* User details section with dynamic text */}
              {/* <div className="bg-gray-50 rounded-lg p-4 mb-4"> */}
                {/* <p className="font-medium text-gray-900 mb-1">
                  {scanResult.type === 'return' ? 'Returned By:' :
                   scanResult.type === 'request' ? 'Collected By:' :
                   'Processed By:'}
                </p> */}
                {/* <p className="text-gray-600">
                  {scanResult.type === 'return' ?
                    (scanResult.keyData?.returnedBy?.name || 'Unknown User') :
                   scanResult.type === 'request' ?
                    (scanResult.keyData?.takenBy?.name || scanResult.key?.takenBy?.name || 'Unknown User') :
                   'Security Personnel'}
                </p> */}
                {/* <p className="text-gray-500 text-sm">
                  {scanResult.type === 'return' ?
                    (scanResult.keyData?.returnedBy?.email || 'N/A') :
                   scanResult.type === 'request' ?
                    (scanResult.keyData?.takenBy?.email || scanResult.key?.takenBy?.email || 'N/A') :
                   'N/A'}
                </p> */}
                {/* <p className="text-gray-400 text-xs mt-1">
                  {new Date().toLocaleString()}
                </p> */}
              {/* </div> */}

              <p className="text-gray-600 mb-6">
                {scanResult.message}    
              </p>
              <button
                onClick={handleCloseScanResult}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SecurityDashboard;