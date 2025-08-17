import axios from 'axios';
import { handleError, handleSuccess } from '../utils/errorHandler.js';

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/keys`
  : import.meta.env.MODE === "development"
    ? "http://localhost:6203/api/keys"
    : "/api/keys";

/**
 * Process QR code scan for key return
 * @param {Object|string} qrData - The QR code data (object or JSON string)
 * @returns {Promise<Object>} The API response
 */
export const processQRScanReturn = async (qrData) => {
  try {
    console.log('Processing QR scan return:', qrData);

    // Try the primary route first
    let response;
    try {
      response = await axios.post(`${API_URL}/qr-scan/return`, {
        qrData
      }, {
        withCredentials: true,
      });
    } catch (primaryError) {
      console.log('Primary route failed, trying alternative route:', primaryError.message);

      // If primary route fails with routing error, try alternative route
      if (primaryError.response?.status === 404 || primaryError.message.includes('Invalid ID format')) {
        response = await axios.post(`${API_URL}/qr-scan-return`, {
          qrData
        }, {
          withCredentials: true,
        });
      } else {
        throw primaryError;
      }
    }

    // Don't show automatic success toast here - let the UI handle it
    // handleSuccess(response.data.message);
    return response.data;
  } catch (error) {
    console.error('QR scan return error:', error);
    const errorMessage = handleError(error);
    throw new Error(errorMessage);
  }
};

/**
 * Process QR code scan for key request
 * @param {Object|string} qrData - The QR code data (object or JSON string)
 * @returns {Promise<Object>} The API response
 */
export const processQRScanRequest = async (qrData) => {
  try {
    console.log('Processing QR scan request:', qrData);

    const response = await axios.post(`${API_URL}/qr-scan/request`, {
      qrData
    }, {
      withCredentials: true,
    });

    // Don't show automatic success toast here - let the UI handle it
    // handleSuccess(response.data.message);
    return response.data;
  } catch (error) {
    console.error('QR scan request error:', error);
    const errorMessage = handleError(error);
    throw new Error(errorMessage);
  }
};

/**
 * Validate QR code data structure
 * @param {Object} qrData - The QR code data to validate
 * @returns {Object} Validation result
 */
export const validateQRData = (qrData) => {
  const result = {
    isValid: false,
    type: null,
    errors: []
  };

  if (!qrData || typeof qrData !== 'object') {
    result.errors.push('QR data must be a valid object');
    return result;
  }

  // Check for key return QR code
  if (qrData.returnId && qrData.keyId && qrData.userId) {
    result.isValid = true;
    result.type = 'key-return';
    return result;
  }

  // Check for key request QR code
  if (qrData.requestId && qrData.keyId && qrData.userId) {
    result.isValid = true;
    result.type = 'key-request';
    return result;
  }

  result.errors.push('QR code does not contain valid key data');
  return result;
};

/**
 * Generate QR data for key return
 * @param {string} keyId - The key ID
 * @param {string} userId - The user ID
 * @returns {Object} QR data object
 */
export const generateKeyReturnQRData = (keyId, userId) => {
  // Validate input parameters
  if (!keyId) {
    throw new Error('Key ID is required for QR generation');
  }

  if (!userId) {
    throw new Error('User ID is required for QR generation');
  }

  // Ensure IDs are strings (MongoDB ObjectIds should be strings)
  const keyIdStr = String(keyId);
  const userIdStr = String(userId);

  const qrData = {
    type: 'key-return',
    keyId: keyIdStr,
    userId: userIdStr,
    timestamp: new Date().toISOString(),
    returnId: `ret-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
  };

  return qrData;
};

/**
 * Generate QR data for key request
 * @param {string} keyId - The key ID
 * @param {string} userId - The user ID
 * @returns {Object} QR data object
 */
export const generateKeyRequestQRData = (keyId, userId) => {
  // Validate input parameters
  if (!keyId) {
    throw new Error('Key ID is required for QR generation');
  }

  if (!userId) {
    throw new Error('User ID is required for QR generation');
  }

  // Ensure IDs are strings (MongoDB ObjectIds should be strings)
  const keyIdStr = String(keyId);
  const userIdStr = String(userId);

  return {
    type: 'key-request',
    keyId: keyIdStr,
    userId: userIdStr,
    timestamp: new Date().toISOString(),
    requestId: `req-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
  };
};

/**
 * Parse QR code string data
 * @param {string} qrString - The QR code string
 * @returns {Object} Parsed QR data
 */
export const parseQRString = (qrString) => {
  try {
    return JSON.parse(qrString);
  } catch (error) {
    throw new Error('Invalid QR code format - not valid JSON');
  }
};
