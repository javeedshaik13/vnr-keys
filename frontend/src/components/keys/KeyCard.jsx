import { motion } from "framer-motion";
import { Clock, MapPin, User, QrCode, CheckCircle, TrendingUp } from "lucide-react";
import QRCode from "react-qr-code";
import { useState, useEffect } from "react";
import socketService from "../../services/socketService.js";
import { config } from "../../utils/config.js";

const KeyCard = ({
  keyData,
  variant = "default", // "default", "available", "unavailable", "taken"
  onRequestKey,
  onCollectKey,
  onReturnKey,
  showQR = false,
  qrData = null,
  usageCount,
  userRole // "faculty", "security", "admin"
}) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [localQRData, setLocalQRData] = useState(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [qrSecondsLeft, setQrSecondsLeft] = useState(20);
  const [qrExpired, setQrExpired] = useState(false);
  const [qrCollected, setQrCollected] = useState(false);

  const getStatusColor = () => {
    switch (keyData.status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "unavailable":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = () => {
    switch (keyData.status) {
      case "available":
        return <CheckCircle className="w-4 h-4" />;
      case "unavailable":
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        return `${diffInMinutes} minutes ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} days ago`;
      }
    } catch (error) {
      return "";
    }
  };

  const handleRequestKey = () => {
    if (onRequestKey) {
      onRequestKey(keyData.id);
    }
  };

  const handleReturnKeyClick = async () => {
    if (onReturnKey) {
      setIsGeneratingQR(true);
      try {
        const qrData = await onReturnKey(keyData.id);
        setLocalQRData(qrData);
        setShowQRModal(true);
        setQrExpired(false);
      } catch (error) {
        console.error("Error generating return QR:", error);
      } finally {
        setIsGeneratingQR(false);
      }
    }
  };

  // Countdown for return QR inside this card's modal
  useEffect(() => {
    const MAX_SECONDS = config.qr.validitySeconds;
    if (!showQRModal || !(localQRData || qrData)?.timestamp) return;

    const source = localQRData || qrData;
    const update = () => {
      const createdAt = new Date(source.timestamp).getTime();
      const elapsed = Math.max(0, Math.floor((Date.now() - createdAt) / 1000));
      const left = Math.max(0, MAX_SECONDS - elapsed);
      setQrSecondsLeft(left);
      setQrExpired(left <= 0);
    };

    update();
    const id = setInterval(update, 500);
    return () => clearInterval(id);
  }, [showQRModal, localQRData, qrData]);

  // Listen for socket event indicating the QR was scanned/collected by security
  useEffect(() => {
    if (!showQRModal) return;

    // Ensure socket is connected
    try { socketService.connect(); } catch (_) {}

    const handler = (data) => {
      try {
        if (data?.action !== 'qr-return') return;
        const currentQR = localQRData || qrData;
        if (!currentQR) return;
        const eventKeyId = data.key?._id || data.key?.id;
        if (eventKeyId && eventKeyId === currentQR.keyId) {
          setQrCollected(true);
          setQrExpired(false);
        }
      } catch {}
    };

    // Primary: user-specific event
    socketService.on('userKeyUpdated', handler);
    // Fallback: global key update event
    socketService.on('keyUpdated', handler);
    return () => {
      socketService.off('userKeyUpdated', handler);
      socketService.off('keyUpdated', handler);
    };
  }, [showQRModal, localQRData, qrData]);

  const handleCollectKey = () => {
    if (onCollectKey) {
      onCollectKey(keyData.id);
    }
  };

  // Removed unused handleToggleFrequent; parent passes handler directly to KeyCard when needed

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-lg"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white">
                Key #{keyData.keyNumber}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor()}`}>
                {getStatusIcon()}
                <span className="capitalize">{keyData.status}</span>
              </span>
            </div>
            <p className="text-emerald-200 font-medium">{keyData.keyName}</p>
            {usageCount && (
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-blue-400 font-medium">
                  Used {usageCount} time{usageCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 mb-3 text-gray-300">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{keyData.location}</span>
        </div>

        {/* Status Info */}
        {keyData.status === "unavailable" && keyData.takenBy && (
          <div className="flex items-center gap-2 mb-3 text-gray-300">
            <User className="w-4 h-4" />
            <span className="text-sm">
              Taken by {keyData.takenBy.name}
              {keyData.takenAt && (
                <span className="text-gray-400 ml-1">
                  • {formatTime(keyData.takenAt)}
                </span>
              )}
            </span>
          </div>
        )}

        {/* QR Code Display for taken keys */}
        {showQR && qrData && (
          <div className="mb-4 p-3 bg-white rounded-lg">
            <div className="flex justify-center">
              <QRCode value={JSON.stringify(qrData)} size={120} />
            </div>
            <p className="text-center text-xs text-gray-600 mt-2">
              Show this QR code to security to return the key
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          {/* QR Generation buttons - only show for non-security users */}
          {userRole !== "security" && (
            <>
              {variant === "default" && keyData.status === "available" && (
                <button
                  onClick={handleRequestKey}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  Generate QR to Request
                </button>
              )}

              {variant === "default" && keyData.status === "unavailable" && (
                <div className="flex-1 bg-red-600/20 text-red-300 py-2 px-4 rounded-lg font-medium text-center border border-red-600/30">
                  Not Available
                </div>
              )}

              {variant === "taken" && (
                <button
                  onClick={handleReturnKeyClick}
                  disabled={isGeneratingQR}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isGeneratingQR ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4" />
                      Show Return QR
                    </>
                  )}
                </button>
              )}
            </>
          )}

          {/* Security-specific actions */}
          {userRole === "security" && variant === "unavailable" && (
            <button
              onClick={handleCollectKey}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Collect
            </button>
          )}

          {/* Non-security unavailable key display */}
          {userRole !== "security" && variant === "unavailable" && (
            <div className="flex-1 bg-red-600/20 text-red-300 py-2 px-4 rounded-lg font-medium text-center border border-red-600/30">
              Not Available
            </div>
          )}
        </div>
      </motion.div>

      {/* QR Modal for return */}
      {showQRModal && (localQRData || qrData) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-sm w-full"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Return Key #{keyData.keyNumber}
            </h3>
            {qrCollected ? (
              <>
                <div className="flex justify-center mb-4">
                  <CheckCircle className="w-20 h-20 text-green-600" />
                </div>
                <p className="text-center text-green-700 font-semibold mb-4">
                  QR collected by security
                </p>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  <QRCode value={JSON.stringify(localQRData || qrData)} size={200} />
                </div>
                <p className="text-center text-gray-900 mb-2 text-sm whitespace-nowrap">
                  Show this QR code to security to return the key
                </p>
                <p className={`text-center mb-4 text-sm font-bold ${qrExpired ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                  {qrExpired ? 'QR expired' : `Expires in ${String(Math.floor(qrSecondsLeft / 60)).padStart(2,'0')}:${String(qrSecondsLeft % 60).padStart(2,'0')}`}
                </p>
              </>
            )}
            {qrExpired ? (
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    if (!onReturnKey) return;
                    setIsGeneratingQR(true);
                    try {
                      const newQR = await onReturnKey(keyData.id);
                      setLocalQRData(newQR);
                      setQrExpired(false);
                      setQrCollected(false);
                    } finally {
                      setIsGeneratingQR(false);
                    }
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Regenerate
                </button>
                <button
                  onClick={() => {
                    setShowQRModal(false);
                    setLocalQRData(null);
                    setQrCollected(false);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setLocalQRData(null);
                  setQrCollected(false);
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                {qrCollected ? 'Done' : 'Close'}
              </button>
            )}
          </motion.div>
        </div>
      )}
    </>
  );
};

export default KeyCard;