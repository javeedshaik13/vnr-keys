import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, X, AlertCircle } from "lucide-react";
import QrScanner from "qr-scanner";

const QRScanner = ({ onScan, onClose, isOpen }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isOpen && videoRef.current && !isInitializing) {
      startScanner();
    }

    return () => {
      stopScanner();
    };
    // We intentionally don't include startScanner to avoid re-creating the scanner instance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isInitializing]);

  const startScanner = async () => {
    if (isInitializing) return;
    
    try {
      setIsInitializing(true);
      setError(null);
      setIsScanning(false);

      // Ensure video element exists and is in DOM
      if (!videoRef.current || !videoRef.current.isConnected) {
        throw new Error("Video element not ready");
      }

      // Check if camera is available
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        throw new Error("No camera found on this device");
      }

      // Stop any existing scanner first
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current.destroy();
        scannerRef.current = null;
      }

      // Create scanner instance
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          try {
            console.log('🔍 QR Scanner: Raw scan result:', result.data);
            
            // Try to parse as JSON first
            let qrData;
            try {
              qrData = JSON.parse(result.data);
            } catch (jsonError) {
              // If JSON parsing fails, try to handle as plain text
              console.log('⚠️ QR Scanner: JSON parsing failed, treating as plain text');
              qrData = result.data;
            }
            
            console.log('✅ QR Scanner: Parsed QR data:', qrData);
            onScan(qrData);
            stopScanner();
          } catch (parseError) {
            console.error('❌ QR Scanner: Parse error:', parseError);
            setError("Invalid QR code format: " + parseError.message);
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: "environment", // Use back camera on mobile
          maxScansPerSecond: 5, // Limit scan rate to avoid overwhelming
        }
      );

      // Wait a bit before starting to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await scannerRef.current.start();
      setIsScanning(true);
      console.log('✅ QR Scanner: Camera started successfully');
    } catch (err) {
      console.error("❌ QR Scanner error:", err);
      
      // Provide more specific error messages
      let errorMessage = "Failed to start camera";
      if (err.name === 'NotAllowedError') {
        errorMessage = "Camera access denied. Please allow camera permissions and try again.";
      } else if (err.name === 'NotFoundError') {
        errorMessage = "No camera found on this device.";
      } else if (err.name === 'NotReadableError') {
        errorMessage = "Camera is already in use by another application.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsScanning(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
      
      // Stop any media streams directly
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      // Clear video source
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.load();
      }
    } catch (error) {
      console.error('Error stopping scanner:', error);
    }
    
    setIsScanning(false);
    setIsInitializing(false);
  };

  const handleClose = async () => {
    await stopScanner();
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
              <div className="space-y-3">
                <button
                  onClick={startScanner}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={handleClose}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors ml-3"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
              onLoadedMetadata={() => {
                console.log('✅ Video metadata loaded');
              }}
              onError={(e) => {
                console.error('❌ Video error:', e);
                setError('Video playback error occurred');
              }}
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
        <div className="flex items-center justify-between">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Go Back
          </button>
          <div className="flex items-center gap-2 text-gray-300">
            <Camera className="w-5 h-5" />
            <span className="text-sm">
              {isScanning ? "Scanning..." : "Camera not active"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;