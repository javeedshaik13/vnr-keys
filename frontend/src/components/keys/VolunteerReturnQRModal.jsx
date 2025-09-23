import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QrCode, X } from "lucide-react";
import QRCode from "react-qr-code";

const VolunteerReturnQRModal = ({
  isOpen,
  onClose,
  selectedKeys,
  user,
  onQRExpired,
}) => {
  const [qrData, setQrData] = useState(null);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [qrExpired, setQrExpired] = useState(false);

  // Generate QR data when modal opens
  useEffect(() => {
    if (isOpen && selectedKeys.length > 0) {
      // Generate QR code data that matches the scanning endpoint's expectations
      const newQRData = {
        qrData: {
          type: "KEY_RETURN",
          keyIds: selectedKeys,
          timestamp: new Date().toISOString()
        }
      };
      setQrData(newQRData);
      setTimer(300); // Reset timer
      setQrExpired(false);
    }
  }, [isOpen, selectedKeys]);

  // Timer countdown
  useEffect(() => {
    let interval;
    if (isOpen && timer > 0 && !qrExpired) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setQrExpired(true);
            onQRExpired?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer, qrExpired, onQRExpired]);

  if (!isOpen) return null;

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-xl p-6 max-w-sm w-full relative"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <QrCode className="w-12 h-12 text-blue-500 mx-auto mb-2" />
          <h3 className="text-xl font-bold text-white">
            Return {selectedKeys.length} Key{selectedKeys.length > 1 ? "s" : ""}
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Show this QR code to security for scanning
          </p>
        </div>

        {/* QR Code Display */}
        {qrData && !qrExpired && (
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-4">
            <div className="flex justify-center">
              <QRCode
                value={JSON.stringify(qrData)}
                size={200}
                bgColor="#1f2937"
                fgColor="#ffffff"
              />
            </div>
          </div>
        )}

        {/* Timer Display */}
        <div className="text-center">
          {qrExpired ? (
            <p className="text-red-500 font-medium">QR Code Expired</p>
          ) : (
            <p className="text-blue-400 font-medium">
              Time remaining: {minutes}:{seconds.toString().padStart(2, "0")}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          {qrExpired ? (
            <button
              onClick={() => {
                setTimer(300);
                setQrExpired(false);
                // Regenerate QR with new timestamp
                const newQRData = {
                  ...qrData,
                  timestamp: new Date().toISOString()
                };
                setQrData(newQRData);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Generate New QR Code
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VolunteerReturnQRModal;