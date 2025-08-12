import { motion } from "framer-motion";
import { Clock, MapPin, User, Star, QrCode, CheckCircle } from "lucide-react";
import QRCode from "react-qr-code";
import { useState } from "react";

const KeyCard = ({
  keyData,
  variant = "default", // "default", "available", "unavailable", "taken"
  onRequestKey,
  onCollectKey,
  onToggleFrequent,
  showQR = false,
  qrData = null
}) => {
  const [showQRModal, setShowQRModal] = useState(false);

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

  // Return action is handled via QR modal trigger; no separate handler needed

  const handleCollectKey = () => {
    if (onCollectKey) {
      onCollectKey(keyData.id);
    }
  };

  const handleToggleFrequent = () => {
    if (onToggleFrequent) {
      onToggleFrequent(keyData.id);
    }
  };

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
          </div>

                     {/* Favorite toggle for faculty */}
           {variant === "default" && onToggleFrequent && (
             <button
               onClick={handleToggleFrequent}
               className="p-2 rounded-lg hover:bg-white/10 transition-colors"
               title={keyData.frequentlyUsed ? "Remove from favorites" : "Add to favorites"}
             >
               {keyData.frequentlyUsed ? (
                 <Star className="w-5 h-5 text-yellow-400 fill-current" />
               ) : (
                 <Star className="w-5 h-5 text-gray-400" />
               )}
             </button>
           )}
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
              onClick={() => setShowQRModal(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              Show Return QR
            </button>
          )}

          {variant === "unavailable" && (
            <button
              onClick={handleCollectKey}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Collect
            </button>
          )}
        </div>
      </motion.div>

      {/* QR Modal for return */}
      {showQRModal && qrData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-sm w-full"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Return Key #{keyData.keyNumber}
            </h3>
            <div className="flex justify-center mb-4">
              <QRCode value={JSON.stringify(qrData)} size={200} />
            </div>
            <p className="text-center text-gray-600 mb-4">
              Show this QR code to security to return the key
            </p>
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default KeyCard;