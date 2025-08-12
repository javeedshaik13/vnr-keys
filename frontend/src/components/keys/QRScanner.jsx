import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, X, AlertCircle } from "lucide-react";
import QrScanner from "qr-scanner";

const QRScanner = ({ onScan, onClose, isOpen }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  // Camera permission status; reserved for future UI feedback
  // Camera permission status removed to avoid unused state
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      startScanner();
    }

    return () => {
      stopScanner();
    };
    // We intentionally don't include startScanner to avoid re-creating the scanner instance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const startScanner = async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Check if camera is available
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        throw new Error("No camera found on this device");
      }

      // Create scanner instance
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          try {
            const qrData = JSON.parse(result.data);
            onScan(qrData);
            stopScanner();
          } catch (parseError) {
            setError("Invalid QR code format");
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: "environment", // Use back camera on mobile
        }
      );

      await scannerRef.current.start();
    } catch (err) {
      console.error("Scanner error:", err);
      setError(err.message || "Failed to start camera");
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-md">
        <h2 className="text-white text-lg font-semibold">Scan QR Code</h2>
        <button
          onClick={handleClose}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 relative">
        {error ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-white text-xl font-semibold mb-2">Scanner Error</h3>
              <p className="text-gray-300 mb-6">{error}</p>
              <button
                onClick={startScanner}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />

            {/* Scanning Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Scanning Frame */}
                <div className="w-64 h-64 border-2 border-white rounded-lg relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>

                  {/* Scanning Line Animation */}
                  {isScanning && (
                    <motion.div
                      className="absolute left-0 right-0 h-0.5 bg-green-400"
                      animate={{
                        y: [0, 256, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  )}
                </div>

                {/* Instructions */}
                <p className="text-white text-center mt-6 text-lg">
                  Position the QR code within the frame
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-black/50 backdrop-blur-md">
        <div className="flex items-center justify-center gap-2 text-gray-300">
          <Camera className="w-5 h-5" />
          <span className="text-sm">
            {isScanning ? "Scanning..." : "Camera not active"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;